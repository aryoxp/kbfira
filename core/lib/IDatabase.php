<?php 

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

interface IDatabase {

	// instantiation template
	public static function instance( $config );
	
	// informational templates
	public function getInsertId();
	public function getAffectedRows();
	public function getError();

  // query template
  public function query( $query );
	public function getVar( $query );
	public function getRow( $query );

	// transaction templates
  public function begin();
  public function commit();
  public function rollback();
	
}
