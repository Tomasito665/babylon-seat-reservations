(function($) {
    window.BBLNSeats = (function () {
        var instance;

        var me = {
            updateData: function (concertName) {
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        action: 'bblnseats_getConcertData',
                        concert_name: concertName
                    },
                    success: function (response) {
                        console.log(response);
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            },

            updateConcertList: function(currentConcertName) {
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    dataType: 'json',
                    data: {action: 'bblnseats_getConcertList'},
                    success: function(response) {
                        var data = response.data[1];

                        for (var i = 0; i < data.length; i++) {
                            var concertName = data[i].name;

                            $('#select-concert')
                                .append($("<option></option>")
                                .attr("value", concertName)
                                .text(concertName));
                        }

                        if (!!currentConcertName) {
                            $('#select-concert').val(currentConcertName);
                        }
                    },
                    error: function(error) {
                        console.log(error);
                    }
                });
            },

            updateConcertListItem: function(concert) {
                console.log("$('#select-concert').val('" + concert + '\')');
                $('#select-concert').val('');
            }
        };

        function createInstance() {
            return me;
        }

        return {
            getInstance: function () {
                if (!instance) instance = createInstance();
                return instance;
            }
        };
    })();

    $(document).ready(function() {
        window.BBLNSeats.getInstance();
    });
})(jQuery);