<?php
	global $wpdb;

	echo "<h1>Reservar asientos</h1>";

	function asientos_crearBloque($filas, $impar, &$datos) {
		static $sillaCount = 0;
		echo "<table>";

		for ($i = 1; $i <= $filas; $i++) {
			echo "<tr>";

			for ($j = 1; $j <= 13; $j++) { // TODO meter 13 en variable
				$silla = $j * 2;
				if ($impar) $silla--;
				else {
					$silla = (14 * 2) - $silla; // TODO hazer esto generico
				}

				$clase = "silla";
				if ($datos[$sillaCount]->reservada)
					$clase .= " reservada";

				echo "<th id='" . ++$sillaCount . "' class='" . $clase . "'><span>" . $silla . "</span></th>";
			}

			echo "</tr>";
		}

		echo "</table>";
	}

	function asientos_crearIndicadorFilas($filas) {
		echo "<table class='indicador-filas'>";

		for ($i = 1; $i <= $filas; $i++) {
			echo "<tr><th>";
			echo $i;
			echo "</th></tr>";
		}

		echo "</table>";
	}

	function asientos_crearSeccion($nombre, $filas, &$datos) {
		echo "<article class='seccion'>";
			echo "<h3 class='titulo-seccion'>" . $nombre . "</h3>";
			echo "<div class='table-wrapper'>";
				asientos_crearBloque($filas, false, $datos);
				asientos_crearIndicadorFilas($filas);
				asientos_crearBloque($filas, true, $datos);
			echo "</div'>";
		echo "</article>";
	}


	/* -- Implementacion -- */
	$datos = $wpdb->get_results("SELECT * FROM wp_asientos"); // TODO Meter em nombre de base de datos en variable global
	asientos_crearSeccion("Amfiteatre", 6, $datos);
	asientos_crearSeccion("Pati de butaques", 11, $datos);
?>



<!-- HTML -->
<div class="pop-modificar-reserva">
    <form method="post" id="form_actualizar-reserva">
			<input type="checkbox" name="reserva" value="reservada">Reservada</input><br>
      <input type="text" size="30" name="nombre" />

      <input type="submit" value="Actualizar" name="commit" id="input_modificar_reserva"/>
    </form>
</div>
