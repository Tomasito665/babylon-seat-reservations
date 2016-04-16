<?php
/**
 *  Plugin Name: Reservas
 *  Plugin URI: www.babylondanza.com
 *  Author: Jordi Ortolá Ankum
 *  Description: Un sistema basico para poder hacer reservas de asientos para el teatro.
 *  Version: 0.0.1
 */


/**
 * Add the plugin page to the main menu for users that have the 'delete pages' capability.
 */

function BBLNSeats_addPage() {
    add_menu_page('BBLNSeats_menu', 'Reservar Asientos', 'delete_pages', 'bbln_seats/BBLNSeats_adminpage.php');
}

add_action('admin_menu', 'BBLNSeats_addPage');



/**
 * Save all server-side PHP errors to error.html
 */

function save_error() {
    file_put_contents(ABSPATH . 'wp-content/plugins/bbln_seats/error.html', ob_get_contents());
}

add_action('activated_plugin', 'save_error');



/**
 * Enqeue scripts and styles for the plugin.
 * @param $hook
 */

function BBLNSeats_enqeueScripts($hook) {
    if ('bbln_seats/BBLNSeats_adminpage.php' != $hook)
        return;

    wp_register_style('bbln_seats', plugins_url('bbln_seats/BBLNSeats.css'));
    wp_enqueue_style('bbln_seats');

    wp_enqueue_script('pluginscript', plugins_url('BBLNSeats_adminpage.js', __FILE__));
    wp_localize_script('pluginscript', 'BBLN_SEATS', array(
        'security' => wp_create_nonce('bbln_sets')
    ));

    global $wpdb;
    wp_localize_script('pluginscript', 'BBLN_SEATS_DATA', array(
        'data' => $wpdb->get_results("SELECT * FROM wp_bblnseats")
    ));
}

add_action('admin_enqueue_scripts', 'BBLNSeats_enqeueScripts');



/**
 * Save changes to the database according to the data received by AJAX.
 * @return mixed
 */

function BBLNSeats_saveChanges() {
    global $wpdb;

    if (!check_ajax_referer('bbln_sets', 'security')) {
        return wp_send_json_error("The nonce code is not valid.");
    }

    $id = (int)$_POST['id'];
    $reserved = (int)$_POST['reserved'];
    $name = $_POST['name'];

    // Update database
    $wpdb->update(
        'wp_bblnseats',
        array(
            'reserved' => $reserved,
            'name' => $name
        ),
        array(
            'id' => $id
        ),
        array(
            '%d',
            '%s'
        )
    );

    $return = $wpdb->get_results("SELECT * FROM wp_bblnseats WHERE id=$id");
    return wp_send_json_success($return);
}

add_action('wp_ajax_BBLNSeats_saveChanges', 'BBLNSeats_saveChanges');



/**
 * Instantiate and format the databases.
 */

function BBLNSeats_createDb() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    $table_name = $wpdb->prefix . 'bblnseats';

    $sql = "CREATE TABLE $table_name (
			id smallint(5) NOT NULL AUTO_INCREMENT,
			fila tinyint(5) NOT NULL,
			silla tinyint(5) NOT NULL,
			reserved tinyint(5) NOT NULL DEFAULT 0,
			name tinytext NOT NULL,
			UNIQUE KEY id (id)
		) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);

    // Fill database with rows
    for ($i = 0; $i < 500; $i++) {
        $wpdb->insert($table_name, array(
            'reserved' => 0,
            'name' => ""
        ));
    }
}

register_activation_hook(__FILE__, 'BBLNSeats_createDb');