<?php

use QBRaw as GlobalQBRaw;

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

/**
 * Inner class to identify a raw entry
 */
class QBRaw {
  public $raw = '';
  public function __construct($raw) {
    $this->raw = $raw;
  }
}

/**
 * An inner class of multiple tuples of an insert.
 */
class QBInsert {
  public $cols, $tuples = [];
  public function __construct($cols, $tuples) {
    $this->cols = $cols;
    $this->tuples = $tuples;
  }
  public function push($tuples) {
    $this->tuples = [...$this->tuples, ...$tuples];
  }
}

/**
 * Inner class for each joined table clause.
 */
class QBJoin {
  public $table, $type, $conditions = [];
  public function __construct($table, $conditions = [], $type = QB::JOIN) {
    $this->table = $table;
    $this->type = $type;
    $this->conditions = $conditions; // key-values = left-right
  }
}

/**
 * Inner class for each where clause.
 */
class QBWhere {
  public $col, $op, $val, $con;
  public function __construct($col, $opVal = null, $val = null, $con = QB::AND) {
    // if ($col instanceof QBRaw || $col == QB::OG || $col == QB::EG) {
    if ($col == QB::OG || $col == QB::EG) {
      $this->col = $col;
      $this->con = $opVal; // QB::AND or QB::OR
      return;
    }
    $this->col = $col;
    $this->op  = $val === null ? '=' : $opVal;
    $this->val = $val === null ? $opVal : $val;
    $this->con = $con;
  }
  public function flat() {
    if ($this->col instanceof QBRaw && !$this->op && !$this->val) return $this->col->raw;
    if ($this->col == QB::OG || $this->col == QB::EG) return $this->col;
    if ($this->val === null) $this->op = QB::IS;
    return QB::bt($this->col) . QB::SP . $this->op . QB::SP . QB::qt($this->val);
  }
}

/**
 * Inner class for each having clause.
 */
class QBHaving {
  public $col, $op, $val, $con;
  public function __construct($col, $opVal = null, $val = null, $con = QB::AND) {
    // if ($col instanceof QBRaw || $col == QB::OG || $col == QB::EG) {
    if ($col == QB::OG || $col == QB::EG) {
      $this->col = $col;
      $this->con = $opVal; // QB::AND or QB::OR
      return;
    }
    $this->col = $col;
    $this->op  = $val === null ? '=' : $opVal;
    $this->val = $val === null ? $opVal : $val;
    $this->con = $con;
  }
  public function flat() {
    if ($this->col instanceof QBRaw && !$this->op && !$this->val) return $this->col->raw;
    if ($this->col == QB::OG || $this->col == QB::EG) return $this->col;
    return QB::bt($this->col) . QB::SP . $this->op . QB::SP . QB::qt($this->val);
  }
}

/**
 * Inner class for each order-by clause.
 */
class QBOrder {
  public $col, $order;
  public function __construct($col, $order = QB::ASC) {
    $this->col = $col;
    $this->order = $order;
  }
  public function flat() {
    return QB::bt($this->col) .
      ($this->order != QB::ASC ? QB::SP . $this->order : "");
  }
}

/**
 * Base class of QueryBuilder.
 * Provides generic query building functions and keywords.
 */
abstract class QBBase {

  public const SP    = ' ';
  public const OR    = 'OR';
  public const AND   = 'AND';
  public const OG    = '(';
  public const EG    = ')';
  public const ASC   = 'ASC';
  public const DESC  = 'DESC';
  public const RAND  = 'RAND()';
  public const IS    = 'IS';
  public const ISNOT = 'IS NOT';
  public const IN    = 'IN';
  public const NOTIN = 'NOT IN';
  public const EQ    = '=';
  public const NEQ   = '<>';
  public const LIKE  = 'LIKE';

  public const INNER = 'INNER JOIN';
  public const LEFT  = 'LEFT JOIN';
  public const RIGHT = 'RIGHT JOIN';
  public const CROSS = 'CROSS JOIN';
  public const JOIN  = 'JOIN';

  public static function raw($raw) {
    return new QBRaw($raw);
  }

  public static function default() {
    return new QBRaw("DEFAULT");
  }

  public static function bt($column) {

    if ($column instanceof QBRaw) return $column->raw;

    $rColumn = preg_replace_callback(
      '/(.+?)\.(.+)\s+as\s+(.+$)/i',
      function ($matches) { //var_dump($matches);
        return sprintf('`%s`.`%s` AS `%s`', $matches[1], $matches[2], $matches[3]);
      },
      $column
    );
    if ($rColumn != $column) return $rColumn;

    $rColumn = preg_replace_callback(
      '/(.+?)\.(.+)\s+(.+$)/i',
      function ($matches) { //var_dump($matches);
        return sprintf('`%s`.`%s` `%s`', $matches[1], $matches[2], $matches[3]);
      },
      $column
    );
    if ($rColumn != $column) return $rColumn;

    $rColumn = preg_replace_callback(
      '/(.+?)\s+as\s+(.+)/i',
      function ($matches) { //var_dump($matches);
        return sprintf('`%s` AS `%s`', $matches[1], $matches[2]);
      },
      $column
    );
    if ($rColumn != $column) return $rColumn;

    $rColumn = preg_replace_callback(
      '/(.+?)\.(.+)/i',
      function ($matches) { //var_dump($matches);
        return sprintf('`%s`.`%s`', $matches[1], $matches[2]);
      },
      $column
    );
    if ($rColumn != $column) return $rColumn;

    $rColumn = preg_replace_callback(
      '/(.+?)\s+(.+)/i',
      function ($matches) { //var_dump($matches);
        return sprintf('`%s` `%s`', $matches[1], $matches[2]);
      },
      $column
    );
    if ($rColumn != $column) return $rColumn;

    return sprintf('`%s`', $column);
  }

  public static function qt($value) {
    if ($value instanceof QBRaw) return $value->raw;
    if ($value === null) return 'NULL';
    return sprintf('\'%s\'', $value);
  }

  public static function esc($value = null) {
    if ($value !== null) return addslashes($value);
    return $value;
  }

  // Aliases

  public abstract function join($table, $leftColumnOrConditions, $rightColumn = null, $type = QB::JOIN);
  public function leftJoin($table, $leftColumnOrConditions, $rightColumn = null) {
    return $this->join($table, $leftColumnOrConditions, $rightColumn, QB::LEFT);
  }
  public function rightJoin($table, $leftColumnOrConditions, $rightColumn = null) {
    return $this->join($table, $leftColumnOrConditions, $rightColumn, QB::RIGHT);
  }
  public function innerJoin($table, $leftColumnOrConditions, $rightColumn = null) {
    return $this->join($table, $leftColumnOrConditions, $rightColumn, QB::INNER);
  }
  public function crossJoin($table, $leftColumnOrConditions, $rightColumn = null) {
    return $this->join($table, $leftColumnOrConditions, $rightColumn, QB::CROSS);
  }

  public abstract function get();
  public function sql() {
    return $this->get();
  }
}

/**
 * Main Query Builder class. 
 * Provides helper functions to compose an SQL query.
 */
class QB extends QBBase {

  private const T_SELECT  = 'SELECT';
  private const T_DELETE  = 'DELETE';
  private const T_INSERT  = 'INSERT';
  private const T_INSERTS = 'INSERTS';
  private const T_UPDATE  = 'UPDATE';

  private $_table;

  private $_selects = [];
  private $_joins = [];
  private $_insert;
  private $_update = [];
  private $_wheres  = [];
  private $_groups  = [];
  private $_havings = [];
  private $_orders = [];
  private $_limit;


  // flags
  private $_type;
  private $_distinct = false;
  private $_foundrows = false;
  private $_ignore = false;

  public static function instance($table) {
    return (new QB())->table($table);
  }

  /**
   *  Query builders helpers
   */
  public function table($table = null) {
    if ($table == null) return $this;
    if ($table instanceof QBRaw) $this->_table = $table->raw;
    $this->_table = $table;
    return $this;
  }

  public function select(...$cols) {
    $this->_type = QB::T_SELECT;
    if (count($cols) == 0) {
      $this->_selects[] = QB::raw('*');
      return $this;
    }

    $cols = array_map(function ($v) {
      return (is_null($v)) ? QB::raw('NULL') : $v;
    }, $cols);
    $this->_selects = array_merge($this->_selects, $cols);
    return $this;
  }

  public function distinct() {
    $this->_distinct = true;
    return $this;
  }

  public function foundrows() {
    $this->_foundrows = true;
    return $this;
  }

  public function join($table, $leftColumnOrConditions, $rightColumn = null, $type = QB::JOIN) {
    $this->_joins[] = is_array($leftColumnOrConditions) ?
      new QBJoin($table, $leftColumnOrConditions, $type) :
      new QBJoin($table, array($leftColumnOrConditions => $rightColumn), $type);
    return $this;
  }

  public function delete() {
    $this->_type = QB::T_DELETE;
    return $this;
  }

  public function insert($insert, $update = null) {
    if (gettype(reset($insert)) == "array") {
      $updateCol = array_keys($insert[0]);
      return $this->inserts($insert, $update ? $updateCol : false);
    }
    $this->_type = QB::T_INSERT;
    $this->_insert = $insert;
    $this->_update = $update;
    return $this;
  }

  public function inserts($tuples, $update = null) {
    $this->_type = QB::T_INSERTS;
    $this->_update = $update;
    $cols = [];
    foreach ($tuples as $t) {
      if (is_object($t)) $t = (array)$t;
      $cols = array_keys($t);
      break;
    }
    if (!$this->_insert) {
      $this->_insert = new QBInsert($cols, $tuples);
      return $this;
    }
    $this->_insert->push($tuples);
    return $this;
  }

  public function update($key, $value = null) {
    $this->_type = QB::T_UPDATE;
    $this->_update = is_array($key) ? $key : array($key => $value);
    return $this;
  }

  public function ignore() {
    $this->_ignore = true;
    return $this;
  }

  public function where($col, $opVal = null, $val = null, $con = QB::AND) {
    $this->_wheres[] = new QBWhere($col, $opVal, $val, $con);
    return $this;
  }

  public function whereIn($col, $vals = [], $con = QB::AND) {
    if ($vals instanceof QBRaw) return $this->where($col, QB::IN, $vals);
    if (is_null($vals)) return $this->where($col, QB::IS, QB::raw('NULL'));
    if (!is_array($vals)) $vals = [$vals];
    $vals = array_map(function ($v) {
      return (is_null($v)) ? 'NULL' : ($v instanceof QBRaw ? $v : QB::qt($v));
    }, $vals);
    return $this->where($col, QB::IN, QB::raw(QB::OG . implode(", ", $vals) . QB::EG), $con);
  }

  public function groupBy(...$cols) {
    if (count($cols) == 0) return $this;
    $cols = array_map(function ($v) {
      return (is_null($v)) ? QB::raw('NULL') : $v;
    }, $cols);
    $this->_groups = array_merge($this->_groups, $cols);
    return $this;
  }

  public function having($col, $opVal = null, $val = null, $con = QB::AND) {
    $this->_havings[] = new QBHaving($col, $opVal, $val, $con);
    return $this;
  }

  public function orderBy($col, $order = QB::ASC) {
    $this->_orders[] = new QBOrder($col, $order);
    return $this;
  }

  /**
   * Helpers for pagination
   */
  public function limit($offsetOrLimit, $limit = null) {
    $this->_limit = $limit === null ?
      $offsetOrLimit :
      $offsetOrLimit . "," . QB::SP . $limit;
    return $this;
  }

  public function page($page, $perPage = 25) {
    $this->_limit = (($page - 1) * $perPage) . "," . QB::SP . $perPage;
    return $this;
  }

  /**
   * Generate SQL
   * get(): String
   */
  public function get() {
    if (!$this->_table) throw CoreError::instance('QB: Unspecified table.');
    $sql = '';
    switch ($this->_type) {
      case QB::T_SELECT: {
          $sql .= QB::T_SELECT;
          $sql .= $this->_foundrows ? QB::SP . "SQL_CALC_FOUND_ROWS" : "";
          $sql .= $this->_distinct ? QB::SP . "DISTINCT" : "";
          $cols = array_map(function ($v) {
            return ($v instanceof QBRaw) ? $v->raw : QB::bt($v);
          }, $this->_selects);
          $sql .= QB::SP . implode(", ", $cols);
          $sql .= QB::SP . "\nFROM" . QB::SP . QB::bt($this->_table);
          break;
        }
      case QB::T_INSERT: {
          $sql .= QB::T_INSERT . ($this->_ignore ? QB::SP . "IGNORE" : '');
          $sql .= QB::SP . "INTO" . QB::SP . QB::bt($this->_table);
          $cols = array_map(function ($v) {
            return QB::bt($v);
          }, array_keys($this->_insert));
          $sql .= QB::SP . QB::OG . implode("," . QB::SP, $cols) . QB::EG;
          $sql .= QB::SP . "VALUES";
          $vals = array_map(function ($v) {
            return QB::qt($v);
          }, array_values($this->_insert));
          $sql .= QB::SP . QB::OG . implode("," . QB::SP, $vals) . QB::EG;
          if ($this->_update) {
            $sql .= "\nON DUPLICATE KEY UPDATE";
            $update = array_map(function ($k, $v) {
              return "\n" . QB::bt($k) . QB::SP . QB::EQ . QB::SP . QB::qt($v);
            }, array_keys($this->_update), array_values($this->_update));
            $sql .= implode("," . QB::SP, $update);
          }
          break;
        }
      case QB::T_INSERTS: {
          $sql .= QB::T_INSERT . ($this->_ignore ? QB::SP . "IGNORE" : '');
          $sql .= QB::SP . "INTO" . QB::SP . QB::bt($this->_table);
          $cols = array_map(function ($v) {
            return QB::bt($v);
          }, $this->_insert->cols);
          $sql .= QB::SP . QB::OG . implode("," . QB::SP, $cols) . QB::EG;
          $sql .= QB::SP . "VALUES";
          $tuples = array_map(function ($t) {
            if (is_object($t)) $t = (array)$t;
            $vals = array_map(function ($v) {
              return QB::qt($v);
            }, array_values($t));
            return "\n" . QB::OG . implode("," . QB::SP, $vals) . QB::EG;
          }, $this->_insert->tuples);
          $sql .= QB::SP . implode("," . QB::SP, $tuples);
          if ($this->_update) {
            $sql .= "\nAS new \nON DUPLICATE KEY UPDATE";
            $update = array_map(function($col) {
              return "\n" . $col . QB::SP . QB::EQ . QB::SP . "new." . $col;
            }, $this->_update);
            $sql .= implode("," . QB::SP, $update);
          }
          break;
        }
      case QB::T_DELETE: {
          $sql .= QB::T_DELETE . QB::SP . "FROM" . QB::SP . QB::bt($this->_table);
          break;
        }
      case QB::T_UPDATE: {
          $sql .= QB::T_UPDATE . QB::SP . QB::bt($this->_table) . QB::SP . "SET";
          $update = array_map(function ($k, $v) {
            return "\n" . QB::bt($k) . QB::SP . QB::EQ . QB::SP . QB::qt($v);
          }, array_keys($this->_update), array_values($this->_update));
          $sql .= QB::SP . implode("," . QB::SP, $update);
          break;
        }
    }

    if (!empty($this->_joins)) {
      foreach ($this->_joins as $join) {
        $sql .= "\n" . $join->type . QB::SP . QB::bt($join->table);
        $conditions = array_map(function ($k, $v) {
          return QB::bt($k) . QB::SP . QB::EQ . QB::SP . QB::bt($v);
        }, array_keys($join->conditions), array_values($join->conditions));
        $sql .= QB::SP . "ON" . QB::SP . implode(QB::SP . QB::AND . QB::SP, $conditions);
      }
    }

    if (count($this->_wheres)) {
      $sql .= QB::SP . "\nWHERE" . QB::SP;
      $prev = null;
      foreach ($this->_wheres as $i => $where) {
        if ($where->col == QB::OG || $where->col == QB::EG) {
          $sql .= ($where->col == QB::OG && $prev != null &&
            $prev->col != QB::OG ?
            QB::SP . $where->con . QB::SP :
            "");
          $sql .= $where->col;
          $prev = $where;
          continue;
        }
        $sql .= ($i > 0 && $prev != null && $prev->col != QB::OG ?
          QB::SP . $where->con . QB::SP :
          "") . $where->flat();
        $prev = $where;
      }
    }

    if (!empty($this->_groups)) {
      $sql .= QB::SP . "\nGROUP BY";
      $cols = array_map(function ($v) {
        return ($v instanceof QBRaw) ? $v->raw : QB::bt($v);
      }, $this->_groups);
      $sql .= QB::SP . implode("," . QB::SP, $cols);
    }

    if (count($this->_havings)) {
      $sql .= QB::SP . "\nHAVING" . QB::SP;
      $prev = null;
      foreach ($this->_havings as $i => $having) {
        if ($having->col == QB::OG || $having->col == QB::EG) {
          $sql .= ($having->col == QB::OG && $prev != null &&
            $prev->col != QB::OG ?
            QB::SP . $having->con . QB::SP :
            "");
          $sql .= $having->col;
          $prev = $having;
          continue;
        }
        $sql .= ($i > 0 && $prev != null && $prev->col != QB::OG ?
          QB::SP . $having->con . QB::SP :
          "") . $having->flat();
        $prev = $having;
      }
    }

    if (!empty($this->_orders)) {
      $sql .= QB::SP . "\nORDER BY" . QB::SP;
      $orders = array_map(function ($v) {
        return ($v instanceof QBRaw) ? $v->raw : $v->flat();
      }, $this->_orders);
      $sql .= QB::SP . implode("," . QB::SP, $orders);
    }

    if (!empty($this->_limit)) {
      $sql .= QB::SP . "\nLIMIT" . QB::SP . $this->_limit;
    }

    return $sql;
  }

  /**
   * Reset the query builder.
   * Returns a new instance of query builder.
   */
  public function clear() {
    return QB::instance($this->_table);
  }
  public function reset() { // Alias for clear();
    return $this->clear();
  }
}
