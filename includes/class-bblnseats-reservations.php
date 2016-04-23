<?php

if ( ! defined( 'ABSPATH' ) ) exit;

class BBLNSeats_Reservations
{

    /**
     * The single instance of BBLNSeats_Settings.
     * @var    object
     * @access  private
     * @since    1.0.0
     */
    private static $_instance = null;

    /**
     * The main plugin object.
     * @var    object
     * @access  public
     * @since    1.0.0
     */
    public $parent = null;

    /**
     * Prefix for plugin settings.
     * @var     string
     * @access  public
     * @since   1.0.0
     */
    public $base = '';

    /**
     * Available settings for plugin.
     * @var     array
     * @access  public
     * @since   1.0.0
     */
    public $settings = array();

    public function __construct($parent)
    {
        $this->parent = $parent;

        $this->base = 'wpt_';

        // Initialise settings
        add_action('init', array($this, 'init_settings'), 11);

        // Register plugin settings
        add_action('admin_init', array($this, 'register_settings'));

        // Add settings page to menu
        add_action('admin_menu', array($this, 'add_menu_item'));

        // Add settings link to plugins page
        add_filter('plugin_action_links_' . plugin_basename($this->parent->file), array($this, 'add_settings_link'));

        // Add ajax message handlers
        add_action('wp_ajax_bblnseats_getConcertData', array($this, 'getConcertData'));
        add_action('wp_ajax_bblnseats_getConcertList', array($this, 'getConcertList'));
        add_action('wp_ajax_bblnseats_getUser', array($this, 'getUser'));
        add_action('wp_ajax_bblnseats_newBookingToDb', array($this, 'newBookingToDb'));

        // Load Bootstrap
        $bootstrap_dir = $this->parent->assets_url . 'bootstrap';
        wp_enqueue_style( $this->_token . '-bootstrap-css', $bootstrap_dir . '/css/bootstrap.min.css' );
        wp_enqueue_script( $this->_token . '-bootstrap-js', $bootstrap_dir . '/js/bootstrap.min.js' );
    }

    /**
     * Initialise settings
     * @return void
     */
    public function init_settings()
    {
        $this->settings = $this->settings_fields();
    }

    /**
     * Add settings page to main menu
     * @return void
     */
    public function add_menu_item()
    {
        $page = add_menu_page(__('Reservar Plazas', 'bblnseats'), __('Reservar Plazas', 'bblnseats'), 'delete_pages', $this->parent->_token . '_reservations', array($this, 'reservations_page'));
        add_action('admin_menu', $page);
    }

    /**
     * Load settings JS & CSS
     * @return void
     */
    public function settings_assets()
    {
        // We're including the farbtastic script & styles here because they're needed for the colour picker
        // If you're not including a colour picker field then you can leave these calls out as well as the farbtastic dependency for the wpt-admin-js script below
        wp_enqueue_style('farbtastic');
        wp_enqueue_script('farbtastic');

        // We're including the WP media scripts here because they're needed for the image upload field
        // If you're not including an image upload then you can leave this function call out
        wp_enqueue_media();

        wp_register_script($this->parent->_token . '-settings-js', $this->parent->assets_url . 'js/settings' . $this->parent->script_suffix . '.js', array('farbtastic', 'jquery'), '1.0.0');
        wp_enqueue_script($this->parent->_token . '-settings-js');
    }

    /**
     * Add settings link to plugin list table
     * @param  array $links Existing links
     * @return array        Modified links
     */
    public function add_settings_link($links)
    {
        $settings_link = '<a href="options-general.php?page=' . $this->parent->_token . '_settings">' . __('Settings', 'bblnseats') . '</a>';
        array_push($links, $settings_link);
        return $links;
    }

    /**
     * Build settings fields
     * @return array Fields to be displayed on settings page
     */
    private function settings_fields()
    {

        $settings['standard'] = array(
            'title' => __('Standard', 'bblnseats'),
            'description' => __('These are fairly standard form input fields.', 'bblnseats'),
            'fields' => array(
                array(
                    'id' => 'text_field',
                    'label' => __('Some Text', 'bblnseats'),
                    'description' => __('This is a standard text field.', 'bblnseats'),
                    'type' => 'text',
                    'default' => '',
                    'placeholder' => __('Placeholder text', 'bblnseats')
                ),
                array(
                    'id' => 'password_field',
                    'label' => __('A Password', 'bblnseats'),
                    'description' => __('This is a standard password field.', 'bblnseats'),
                    'type' => 'password',
                    'default' => '',
                    'placeholder' => __('Placeholder text', 'bblnseats')
                ),
                array(
                    'id' => 'secret_text_field',
                    'label' => __('Some Secret Text', 'bblnseats'),
                    'description' => __('This is a secret text field - any data saved here will not be displayed after the page has reloaded, but it will be saved.', 'bblnseats'),
                    'type' => 'text_secret',
                    'default' => '',
                    'placeholder' => __('Placeholder text', 'bblnseats')
                ),
                array(
                    'id' => 'text_block',
                    'label' => __('A Text Block', 'bblnseats'),
                    'description' => __('This is a standard text area.', 'bblnseats'),
                    'type' => 'textarea',
                    'default' => '',
                    'placeholder' => __('Placeholder text for this textarea', 'bblnseats')
                ),
                array(
                    'id' => 'single_checkbox',
                    'label' => __('An Option', 'bblnseats'),
                    'description' => __('A standard checkbox - if you save this option as checked then it will store the option as \'on\', otherwise it will be an empty string.', 'bblnseats'),
                    'type' => 'checkbox',
                    'default' => ''
                ),
                array(
                    'id' => 'select_box',
                    'label' => __('A Select Box', 'bblnseats'),
                    'description' => __('A standard select box.', 'bblnseats'),
                    'type' => 'select',
                    'options' => array('drupal' => 'Drupal', 'joomla' => 'Joomla', 'wordpress' => 'WordPress'),
                    'default' => 'wordpress'
                ),
                array(
                    'id' => 'radio_buttons',
                    'label' => __('Some Options', 'bblnseats'),
                    'description' => __('A standard set of radio buttons.', 'bblnseats'),
                    'type' => 'radio',
                    'options' => array('superman' => 'Superman', 'batman' => 'Batman', 'ironman' => 'Iron Man'),
                    'default' => 'batman'
                ),
                array(
                    'id' => 'multiple_checkboxes',
                    'label' => __('Some Items', 'bblnseats'),
                    'description' => __('You can select multiple items and they will be stored as an array.', 'bblnseats'),
                    'type' => 'checkbox_multi',
                    'options' => array('square' => 'Square', 'circle' => 'Circle', 'rectangle' => 'Rectangle', 'triangle' => 'Triangle'),
                    'default' => array('circle', 'triangle')
                )
            )
        );

        $settings['extra'] = array(
            'title' => __('Extra', 'bblnseats'),
            'description' => __('These are some extra input fields that maybe aren\'t as common as the others.', 'bblnseats'),
            'fields' => array(
                array(
                    'id' => 'number_field',
                    'label' => __('A Number', 'bblnseats'),
                    'description' => __('This is a standard number field - if this field contains anything other than numbers then the form will not be submitted.', 'bblnseats'),
                    'type' => 'number',
                    'default' => '',
                    'placeholder' => __('42', 'bblnseats')
                ),
                array(
                    'id' => 'colour_picker',
                    'label' => __('Pick a colour', 'bblnseats'),
                    'description' => __('This uses WordPress\' built-in colour picker - the option is stored as the colour\'s hex code.', 'bblnseats'),
                    'type' => 'color',
                    'default' => '#21759B'
                ),
                array(
                    'id' => 'an_image',
                    'label' => __('An Image', 'bblnseats'),
                    'description' => __('This will upload an image to your media library and store the attachment ID in the option field. Once you have uploaded an imge the thumbnail will display above these buttons.', 'bblnseats'),
                    'type' => 'image',
                    'default' => '',
                    'placeholder' => ''
                ),
                array(
                    'id' => 'multi_select_box',
                    'label' => __('A Multi-Select Box', 'bblnseats'),
                    'description' => __('A standard multi-select box - the saved data is stored as an array.', 'bblnseats'),
                    'type' => 'select_multi',
                    'options' => array('linux' => 'Linux', 'mac' => 'Mac', 'windows' => 'Windows'),
                    'default' => array('linux')
                )
            )
        );

        $settings = apply_filters($this->parent->_token . '_settings_fields', $settings);

        return $settings;
    }

    /**
     * Register plugin settings
     * @return void
     */
    public function register_settings()
    {
        if (is_array($this->settings)) {

            // Check posted/selected tab
            $current_section = '';
            if (isset($_POST['tab']) && $_POST['tab']) {
                $current_section = $_POST['tab'];
            } else {
                if (isset($_GET['tab']) && $_GET['tab']) {
                    $current_section = $_GET['tab'];
                }
            }

            foreach ($this->settings as $section => $data) {

                if ($current_section && $current_section != $section) continue;

                // Add section to page
                add_settings_section($section, $data['title'], array($this, 'settings_section'), $this->parent->_token . '_settings');

                foreach ($data['fields'] as $field) {

                    // Validation callback for field
                    $validation = '';
                    if (isset($field['callback'])) {
                        $validation = $field['callback'];
                    }

                    // Register field
                    $option_name = $this->base . $field['id'];
                    register_setting($this->parent->_token . '_settings', $option_name, $validation);

                    // Add field to page
                    add_settings_field($field['id'], $field['label'], array($this->parent->admin, 'display_field'), $this->parent->_token . '_settings', $section, array('field' => $field, 'prefix' => $this->base));
                }

                if (!$current_section) break;
            }
        }
    }

    public function settings_section($section) {
        $html = '<p> ' . $this->settings[$section['id']]['description'] . '</p>' . "\n";
        echo $html;
    }

    /**
     * Load settings page content
     * @return void
     */
    public function reservations_page() {
        // Build page HTML
        $html = '<div class="wrap" id="' . $this->parent->_token . '_settings">' . "\n";
        $html .= '<h2>' . __('Reservar Plazas', 'bblnseats') . '</h2>' . "\n";

        $html .= '<div id="toolbar">';
            $html .= '
            <select id="select-concert" name="concert-name" placeholder="Concierto">
                <option value="" disabled selected>Selecciona un concierto</option>
            </select>';
        $html .= '</div>';

        $html .= $this->createTableMap(
            array("Amfiteatre", "Pati de butaques"),
            array(6, 11),
            array(13, 13)
        );

        // Adding seat context menu
        $html .= "
            <ul id='seat-context-menu'>
              <li data-action='new' id='new' data-toggle='modal' data-target='#booking-modal'>Reservar</li>
              <li data-action='open' id='open' data-toggle='modal' data-target='#booking-modal'>Abrir reserva</li>
              <li data-action='delete' id='delete' data-toggle='modal' data-target='#booking-modal'>Cancelar Reserva</li>
            </ul>
        ";
        $html .= '</div>' . "\n";

        // Adding booking modal
        $html .= '
            <div class="modal fade" id="booking-modal" tabindex="-1" role="dialog" aria-labelledby="booking-modal-title">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title" id="booking-modal-title">Reservar Plaza</h4>
                  </div>
                  <div class="modal-body">
                    <p>
                        <span class="modal-seat-label">Seccion:</span> <span id="modal-section-label">seccion</span><br>
                        <span class="modal-seat-label">Fila:</span>    <span id="modal-row-label">fila</span><br>
                        <span class="modal-seat-label">Silla:</span>   <span id="modal-seat_no-label">silla</span><br>
                    </p>
                    <form>
                      <div class="form-group">
                        <label for="modal-input-name" class="control-label">Nombre:</label>
                        <input type="text" class="form-control" id="modal-input-name">
                      </div>
                    </form>
                  </div>
                  <div class="modal-footer" id="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="modal-submit">Reservar</button>
                  </div>
                </div>
              </div>
            </div>
        ';

        echo $html;
        $this->updateConcertList();
    }

    /**
     * Build the table map.
     *
     * @param  array $label_list Labels per section
     * @param  array $rows_list Rows per section
     * @param  array $columns_list Columns per section
     *
     * @return string html
     * @since 1.0.0
     */
    public function createTableMap($label_list, $rows_list, $columns_list) {
        $html = '';

        $createBlock = function ($rows, $odd, $columns, $sectionId = 0) {
            static $seatCount = 0;

            $html = "<table class='concert-map'>";

            for ($i = 1; $i <= $rows; $i++) {
                $html .= "<tr>";

                for ($j = 1; $j <= $columns; $j++) {
                    $seat = $j * 2;
                    if ($odd) $seat--;
                    else $seat = (($columns + 1) * 2) - $seat;
                    $html .= "<th id='" . ++$seatCount . "' seat-no='" . $seat . "' row='" . $i . "' section='" . $sectionId . "' class='seat'> <span class='seat-no'>" . $seat . "</span></th>";
                }

                $html .= "</tr>";
            }

            $html .= "</table>";
            return $html;
        };

        $createRowIndicator = function ($rows) {
            $html = "<table class='indicador-filas'>";

            for ($i = 1; $i <= $rows; $i++) {
                $html .= "<tr><th>";
                $html .= $i;
                $html .= "</th></tr>";
            }

            $html .= "</table>";
            return $html;
        };

        $i = 0;
        foreach ($label_list as $l) {
            $html .= "<article class='section' section-id='$i'>";
            $html .= "<h3>" . $l . "</h3>";
            $html .= "<div class='table-wrapper'>";
            $html .= $createBlock($rows_list[$i], false, $columns_list[$i], $i);
            $html .= $createRowIndicator($rows_list[$i]);
            $html .= $createBlock($rows_list[$i], true, $columns_list[$i], $i);
            $html .= "</div>";
            $html .= "</article>";
            $i++;
        }

        return $html;
    }

    public function newBookingToDb() {
        global $wpdb;
        $databasePrefix = BBLNSeats::instance()->database_prefix;
        $seatsTable     = $databasePrefix . DatabaseType::SEATS;
        $usersTable     = $databasePrefix . DatabaseType::USERS;

        // Add new user to database
        $userName = $_POST['user_name'];

        $wpdb->insert($usersTable,
            array('name' => $userName),
            array('%s')
        );

        $userID = $wpdb->get_var("SELECT id FROM $usersTable ORDER BY id DESC LIMIT 0, 1");

        // Add new booking to database
        $concertID  = (int) $_POST['concert_id'];
        $section    = (int) $_POST['section'];
        $row        = (int) $_POST['row'];
        $seatNo     = (int) $_POST['seat_no'];

        $wpdb->insert($seatsTable,
            array(
                'section' => $section,
                'row' => $row,
                'seat_no' => $seatNo,
                'user_id' => $userID,
                'concert_id' => $concertID,
            ),
            array('%d', '%d', '%d', '%d', '%d')
        );

        $seatRow = $wpdb->get_results("
          SELECT * FROM $seatsTable 
          WHERE section=$section
          AND   row=$row
          AND   seat_no=$seatNo
          AND   user_id=$userID
          AND   concert_id=$concertID");

        return wp_send_json_success($seatRow);
    }

    public function getUser() {
        global $wpdb;
        $userID         = $_POST['user_id'];
        $databasePrefix = BBLNSeats::instance()->database_prefix;
        $usersTable     = $databasePrefix . DatabaseType::USERS;

        $user = $wpdb->get_results("SELECT * FROM $usersTable WHERE id=$userID");
        return wp_send_json_success($user);
    }

    public function updateConcertList() {
        $updateConcertList = 'window.BBLNSeats.getInstance().updateConcertList("");';
        echo '<script>' . $updateConcertList . '</script>';
    }

    /**
     * Send JSON response back containing data for a specific concert.
     * Sends JSON error if no such concert has been found.
     *
     * @since 1.0.0
     */
    public function getConcertData() {
        global $wpdb;
        $concertName    = $_POST['concert_name'];
        $databasePrefix = BBLNSeats::instance()->database_prefix;
        $seatsTable     = $databasePrefix . DatabaseType::SEATS;
        $concertsTable  = $databasePrefix . DatabaseType::CONCERTS;

        $concertId      = $wpdb->get_var("SELECT id FROM $concertsTable WHERE name='$concertName'");
        if (is_null($concertId)) return wp_send_json_error("Concert named '" . $concertName . "' does not exist.");
        $concertId = (int) $concertId;

        // Get seats from database
        $seats = $wpdb->get_results("SELECT * FROM $seatsTable WHERE concert_id=$concertId");
        return wp_send_json_success($seats);
    }

    /**
     * Send JSON response back containing a list of concerts.
     *
     * @since 1.0.0
     */
    public function getConcertList() {
        global $wpdb;
        $databasePrefix = BBLNSeats::instance()->database_prefix;
        $concertTable   = $databasePrefix . DatabaseType::CONCERTS;
        $data = $wpdb->get_results("SELECT * FROM $concertTable");
        return wp_send_json_success($data);
    }

    /**
     * Main BBLNSeats_Settings Instance
     *
     * Ensures only one instance of BBLNSeats_Settings is loaded or can be loaded.
     *
     * @since 1.0.0
     * @static
     * @see BBLNSeats()
     * @return Main BBLNSeats_Settings instance
     */
    public static function instance($parent)
    {
        if (is_null(self::$_instance)) {
            self::$_instance = new self($parent);
        }
        return self::$_instance;
    } // End instance()

    /**
     * Cloning is forbidden.
     *
     * @since 1.0.0
     */
    public function __clone()
    {
        _doing_it_wrong(__FUNCTION__, __('Cheatin&#8217; huh?'), $this->parent->_version);
    } // End __clone()

    /**
     * Unserializing instances of this class is forbidden.
     *
     * @since 1.0.0
     */
    public function __wakeup()
    {
        _doing_it_wrong(__FUNCTION__, __('Cheatin&#8217; huh?'), $this->parent->_version);
    } // End __wakeup()
}