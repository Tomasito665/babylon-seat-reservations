(function($){var map=new Array();$.Watermark={ShowAll:function(){for(var i=0;i<map.length;i++){if(map[i].obj.val()==""){map[i].obj.val(map[i].text);map[i].obj.css("color",map[i].WatermarkColor);}else{map[i].obj.css("color",map[i].DefaultColor);}}},HideAll:function(){for(var i=0;i<map.length;i++){if(map[i].obj.val()==map[i].text)map[i].obj.val("");}}}
$.fn.Watermark=function(text,color){if(!color)color="#aaa";return this.each(function(){var input=$(this);var defaultColor=input.css("color");map[map.length]={text:text,obj:input,DefaultColor:defaultColor,WatermarkColor:color};function clearMessage(){if(input.val()==text)input.val("");input.css("color",defaultColor);}function insertMessage(){if(input.val().length==0||input.val()==text){input.val(text);input.css("color",color);}else
input.css("color",defaultColor);}input.focus(clearMessage);input.blur(insertMessage);input.change(insertMessage);insertMessage();});};})(jQuery);



jQuery(document).ready(function() {
  jQuery('#form_actualizar-reserva').submit(function(event) {
  	var id = jQuery(this).attr('id_silla');
  	var reserved = jQuery(this).find('input[name="reservation"]').is(':checked');
    var name = jQuery(this).find('input[name="name"]').val();
  	var popup = jQuery('.pop-change-reservation');
    var silla_elemento = jQuery('#'+id);

  	jQuery.ajax({
  		url: ajaxurl,
  		type: 'POST',
  		dataType: 'json',
  		data: {
  			action: 'BBLNSeats_saveChanges',
  			id: id - 0,
  			reserved: reserved ? 1 : 0,
			name: name,
        	security: BBLN_SEATS.security
  		},
  		success: function(response) {
  			console.log("Success");
			popup.css('visibility', 'hidden');

			// Actualizar la interfaz
			silla_elemento.toggleClass('reserved', reserved);

			// Actualizar los datos del cliente
			BBLN_SEATS_DATA.data[id-1] = response.data[0];
  		},
  		error: function(error) {
  			console.log("Error");
  		}
  	});

  	event.preventDefault();
  });

  jQuery('.pop-change-reservation input[name="name"]').Watermark("name");
  jQuery('.silla').click(function(e) {
  	var id = this.id;
  	var popup = jQuery('.pop-change-reservation');
    var datos = BBLN_SEATS_DATA.data[id-1];

  	popup.offset({
  		top: e.pageY,
  		left: e.pageX
  	});

    popup.find('input[name="name"]').val(datos.name);

    console.log(datos);
    popup.find('input[name="reservation"]')[0].checked = datos.reserved - 0;
  	popup.find('form').attr('id_silla', id);

  	popup.css('visibility', 'visible');
  });

  jQuery(document).mousedown(function (e) {
  	var container = jQuery('.pop-change-reservation');

  	if (!container.is(e.target) && container.has(e.target).length === 0)
  		container.css('visibility', 'hidden');
  });
});
