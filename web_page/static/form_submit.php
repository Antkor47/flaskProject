<?php
$host = "localhost";
$db_name = "Leaderboard";
$username = "snake";
$password = "matopeli123";

$connection = null;

$name = $_COOKIE['name'];
$score = $_COOKIE['score'];

try{
$connection = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
$connection->exec("set names utf8");
}catch(PDOException $exception){
echo "Connection error: " . $exception->getMessage();
}

function saveData($name, $score){
global $connection;
$query = "INSERT INTO leaderboard(name, score) VALUES( :name, :score)";

$callToDb = $connection->prepare( $query );

$callToDb->bindParam(":name",$name);
$callToDb->bindParam(":score",$score);
}

$result = saveData($name, $score);
?>
