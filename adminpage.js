(function($){var map=new Array();$.Watermark={ShowAll:function(){for(var i=0;i<map.length;i++){if(map[i].obj.val()==""){map[i].obj.val(map[i].text);map[i].obj.css("color",map[i].WatermarkColor);}else{map[i].obj.css("color",map[i].DefaultColor);}}},HideAll:function(){for(var i=0;i<map.length;i++){if(map[i].obj.val()==map[i].text)map[i].obj.val("");}}}
$.fn.Watermark=function(text,color){if(!color)color="#aaa";return this.each(function(){var input=$(this);var defaultColor=input.css("color");map[map.length]={text:text,obj:input,DefaultColor:defaultColor,WatermarkColor:color};function clearMessage(){if(input.val()==text)input.val("");input.css("color",defaultColor);}function insertMessage(){if(input.val().length==0||input.val()==text){input.val(text);input.css("color",color);}else
input.css("color",defaultColor);}input.focus(clearMessage);input.blur(insertMessage);input.change(insertMessage);insertMessage();});};})(jQuery);



jQuery(document).ready(function() {
  jQuery('#form_actualizar-reserva').submit(function(event) {
  	var id = jQuery(this).attr('id_silla');
  	var reservada = jQuery(this).find('input[name="reserva"]').is(':checked');
    var nombre = jQuery(this).find('input[name="nombre"]').val();
  	var popup = jQuery('.pop-modificar-reserva');
    var silla_elemento = jQuery('#'+id);

  	jQuery.ajax({
  		url: ajaxurl,
  		type: 'POST',
  		dataType: 'json',
  		data: {
  			action: 'asientos_guardar_cambios',
  			id: id - 0,
  			reservada: reservada ? 1 : 0,
        nombre: nombre,
        security: WP_JOB_LISTING.security
  		},
  		success: function(response) {
  			console.log("Success");
        popup.css('visibility', 'hidden');

        // Actualizar la interfaz
        silla_elemento.toggleClass('reservada', reservada);

        // Actualizar los datos del cliente
        ASIENTOS_DATOS.data[id-1] = response.data[0];
  		},
  		error: function(error) {
  			console.log("Error");
  		}
  	});

  	event.preventDefault();
  });

  jQuery('.pop-modificar-reserva input[name="nombre"]').Watermark("Nombre");
  jQuery('.silla').click(function(e) {
  	var id = this.id;
  	var popup = jQuery('.pop-modificar-reserva');
    var datos = ASIENTOS_DATOS.data[id-1];

  	popup.offset({
  		top: e.pageY,
  		left: e.pageX
  	});

    popup.find('input[name="nombre"]').val(datos.nombre);

    console.log(datos);
    popup.find('input[name="reserva"]')[0].checked = datos.reservada - 0;
  	popup.find('form').attr('id_silla', id);

  	popup.css('visibility', 'visible');
  });

  jQuery(document).mousedown(function (e) {
  	var container = jQuery('.pop-modificar-reserva');

  	if (!container.is(e.target) && container.has(e.target).length === 0)
  		container.css('visibility', 'hidden');
  });
});
