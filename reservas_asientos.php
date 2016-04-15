<?php
  /**
   *  Plugin Name: Reservas
   *  Plugin URI: www.babylondanza.com
   *  Author: Jordi Ortolá Ankum
   *  Description: Un sistema basico para poder hacer reservas de asientos para el teatro.
   *  Version: 0.0.1
   */

	add_action('activated_plugin','save_error');
	function save_error() {
		file_put_contents(ABSPATH. 'wp-content/plugins/reservas_asientos/error.html', ob_get_contents());
	}

	add_action('admin_menu', 'asientos_add_page');
	function asientos_add_page() {
		add_menu_page('reservar_asientos_menu', 'Reservar Asientos', 'delete_pages', 'reservas_asientos/adminpage.php');
	}

	function anadir_recursos($hook) {
	  if( 'reservas_asientos/adminpage.php' != $hook )
	    return;

	  wp_register_style('reservas_asientos', plugins_url('reservas_asientos/reservas_asientos-main.css'));
	  wp_enqueue_style('reservas_asientos');
	  wp_enqueue_script('pluginscript', plugins_url('adminpage.js', __FILE__ ));
		wp_localize_script('pluginscript', 'WP_JOB_LISTING', array(
			'security' => wp_create_nonce('wp-job-order')
		));

		global $wpdb;
		wp_localize_script('pluginscript', 'ASIENTOS_DATOS', array(
			'data' => $wpdb->get_results("SELECT * FROM wp_asientos")
		));
	}
	add_action('admin_enqueue_scripts', 'anadir_recursos');


	function dwwp_guardar_cambios() {
		global $wpdb;

		if (!check_ajax_referer('wp-job-order', 'security')) {
			return wp_send_json_error("El codigo Nonce es invalido.");
		}

		$id = (int)$_POST['id'];
		$reservada = (int)$_POST['reservada'];
		$nombre = $_POST['nombre'];

		// Actualizar entrada en base de datos
		$wpdb->update(
			'wp_asientos',
			array(
				'reservada' => $reservada,
				'nombre' => $nombre
			),
			array(
				'id' => $id
			),
			array(
				'%d',
				'%s'
			)
		);

		$return = $wpdb->get_results("SELECT * FROM wp_asientos WHERE id=$id");
		return wp_send_json_success($return);
	}
	add_action('wp_ajax_asientos_guardar_cambios', 'dwwp_guardar_cambios');


	// -- Base de datos -- //
	register_activation_hook(__FILE__, 'asientos_create_db');
	function asientos_create_db() {
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();
		$table_name = $wpdb->prefix . 'asientos';

		$sql = "CREATE TABLE $table_name (
			id smallint(5) NOT NULL AUTO_INCREMENT,
			fila tinyint(5) NOT NULL,
			silla tinyint(5) NOT NULL,
			reservada tinyint(5) NOT NULL DEFAULT 0,
			nombre tinytext NOT NULL,
			UNIQUE KEY id (id)
		) $charset_collate;";

		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
		dbDelta($sql);

		// Llenar la base de datos
		for ($i = 0; $i < 500; $i++) {
			$wpdb->insert($table_name, array(
			    'reservada' => 0,
					'nombre' => ""
			));
		}
	}
