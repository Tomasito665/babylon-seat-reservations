<?php
/*
 * Plugin Name: BBLNSeats
 * Version: 1.0
 * Plugin URI: http://www.hughlashbrooke.com/
 * Description: This is your starter template for your next WordPress plugin.
 * Author: Jordi Ortolá Ankum
 * Author URI: http://www.jordiortola.nl/
 * Requires at least: 4.0
 * Tested up to: 4.0
 *
 * Text Domain: bblnseats
 * Domain Path: /lang/
 *
 * @package WordPress
 * @author Hugh Lashbrooke
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// Load plugin class files
require_once( 'includes/class-bblnseats.php' );
require_once('includes/class-bblnseats-reservations.php');

// Load plugin libraries
require_once( 'includes/lib/class-bblnseats-admin-api.php' );
require_once( 'includes/lib/class-bblnseats-post-type.php' );
require_once( 'includes/lib/class-bblnseats-taxonomy.php' );

/**
 * Returns the main instance of BBLNSeats to prevent the need to use globals.
 *
 * @since  1.0.0
 * @return object BBLNSeats
 */
function BBLNSeats () {
	$instance = BBLNSeats::instance( __FILE__, '1.0.0' );

	if ( is_null( $instance->settings ) ) {
		$instance->settings = BBLNSeats_Reservations::instance( $instance );
	}

	return $instance;
}

BBLNSeats();
