<?php 

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class CoreDBMysqli extends CoreBaseDatabase implements IDatabase {

  private $lastQuery;
  private $insertId;
  private $affectedRows;

  private $error; // error objects container

  public function __construct($config) {
    // $this->dbConfig = $config;
    parent::__construct($config);
  }

  public static function instance($config) {
    return new CoreDBMysqli($config);
  }

  public function connect() {
    /*
		MySQLi has no pconnect function, 
		so that if configuration says we should use persistent connection, 
		then prepend the host with p:
		*/
    if ($this->dbConfig['persistent']) {
      $this->dbConfig['host'] = "p:" . $this->dbConfig['host'];
    }

    /*
		Start the mysqli connection with given parameter 
		from specified mysqli configuration
		*/

    $this->link = @new mysqli( // suppress warning
      $this->dbConfig['host']
        . (isset($this->dbConfig['port'])
          ? ":" . $this->dbConfig['port']
          : ''),
      $this->dbConfig['user'],
      $this->dbConfig['password'],
      $this->dbConfig['database']
    );

    if ($this->link->connect_errno)
      throw new CoreError("Failed to connect to MySQL: " . $this->link->connect_error);

    $this->link->set_charset($this->dbConfig['charset'] ? $this->dbConfig['charset'] : 'utf8mb4');
    if ($this->dbConfig['collate'])
      $this->link->query("SET collation_connection = " . $this->dbConfig['collate']);
    else $this->link->query("SET collation_connection = utf8mb4_general_ci");

    /*
		And return the connection resources
		*/
    return $this->link;
  }

  public function disconnect() {
    return $this->link->close();
  }

  public function getInsertId() {
    return $this->insertId;
  }
  public function getAffectedRows() {
    return $this->affectedRows;
  }
  public function getError() {
    return $this->error;
  }
  public function getLastQuery() {
    return $this->lastQuery;
  }

  // transaction sets
  public function begin() {
    $this->query("START TRANSACTION");
    $this->query("BEGIN");
  }

  public function commit() {
    $this->query("COMMIT");
  }

  public function rollback() {
    $this->query("ROLLBACK");
  }

  /**
   * Main query function
   */
  public function query($sql, $asObject = true) {
    
    if ($sql instanceof QB) $sql = $sql->get();
    
    if (!$this->link) $this->connect();
    $this->lastQuery = $sql;

    // execute query
    $result = $this->link->query($sql); // var_dump($result);

    if ($result === false) {
      $this->error = $this->link->error;
      throw new CoreError($this->error);
    }
      
    // process result
    if (preg_match("/^\(?(select|show)/i", $sql)) {
      $rows = array();
      do {
        if ($asObject)
          $row = @$result->fetch_object();
        else $row = @$result->fetch_array();
        if ($row) $rows[] = $row;
      } while ($row);
      return $rows;
    } 
      
    $this->insertId = $this->link->insert_id;
    $this->affectedRows = $this->link->affected_rows;

    return $result;
  }

  public function multiQuery($sql, $flush = TRUE) {
    if ($sql instanceof QB) $sql = $sql->get();
    
    if (!$this->link) $this->connect();
    $this->lastQuery = $sql;

    // execute query
    $result = $this->link->query($sql); // var_dump($result);
    do {
      // fetch results
      if($result = $this->link->store_result()) {}
      if(!$this->link->more_results()) break;
      if(!$this->link->next_result()) {
          // report error
          throw CoreError::instance('Error: ' . $this->link->error);
          break;
      }
    } while(true);
    mysqli_free_result($result);
    // if($flush) while ($this->link->next_result()) {;} // flush multi_queries
    return $result;
  }

  public function getVar($query) {
    if ($result = $this->query($query)) {
      $result = (array) $result[0];
      $keys = array_keys($result);
      return $result[$keys[0]];
    } else return NULL;
  }

  public function getRow($query) {
    $result = $this->query($query);
    if ($result && count($result)) return $result[0];
    return NULL;
  }

  // functional template
  public function escape($string) {
    return addslashes($string);
  }
} // End database_mysqli Class