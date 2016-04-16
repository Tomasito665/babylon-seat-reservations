<?php
global $wpdb;

echo "<h1>Reservar plazas</h1>";

function BBLNSeats_createBlock($filas, $impar, &$datos)
{
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
            if ($datos[$sillaCount]->reserved)
                $clase .= " reserved";

            echo "<th id='" . ++$sillaCount . "' class='" . $clase . "'><span>" . $silla . "</span></th>";
        }

        echo "</tr>";
    }

    echo "</table>";
}

function BBLNSeats_createRowIndicator($filas)
{
    echo "<table class='indicador-filas'>";

    for ($i = 1; $i <= $filas; $i++) {
        echo "<tr><th>";
        echo $i;
        echo "</th></tr>";
    }

    echo "</table>";
}

function BBLNSeats_createSection($label, $filas, &$datos)
{
    echo "<article class='seccion'>";
    echo "<h3 class='titulo-seccion'>" . $label . "</h3>";
    echo "<div class='table-wrapper'>";
    BBLNSeats_createBlock($filas, false, $datos);
    BBLNSeats_createRowIndicator($filas);
    BBLNSeats_createBlock($filas, true, $datos);
    echo "</div'>";
    echo "</article>";
}


/* -- Implementacion -- */
$datos = $wpdb->get_results("SELECT * FROM wp_bblnseats");
BBLNSeats_createSection("Amfiteatre", 6, $datos);
BBLNSeats_createSection("Pati de butaques", 11, $datos);
?>


<!-- HTML -->
<div class="pop-change-reservation">
    <form method="post" id="form_actualizar-reserva">
        <input type="checkbox" name="reservation" value="reserved">Reservada</input><br>
        <input type="text" size="30" name="name"/>

        <input type="submit" value="Actualizar" name="commit" id="input_modificar_reserva"/>
    </form>
</div>
