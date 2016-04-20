(function($) {
    window.BBLNSeats = (function () {
        var instance;

        var me = {
            ELEMENTS: {
                SELECT_CONCERT_FORM:  "#form-select-concert",
                SELECT_CONCERT:       '#select-concert',
                CELL_SEAT:            '.seat',
                SECTION:              '.section'
            },

            currentConcert: null,

            updateConcertData: function () {
                var concertName = me.getConcertName();
                console.log("Getting data of '" + concertName + "'");
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        action: 'bblnseats_getConcertData',
                        concert_name: concertName
                    },
                    success: function (response) {
                        me.currentConcert = response.data;
                        me._resetMap();
                        me._updateMap();
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            },

            updateConcertList: function() {
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    dataType: 'json',
                    data: {action: 'bblnseats_getConcertList'},
                    success: function(response) {
                        var data = response.data;

                        for (var i = 0; i < data.length; i++) {
                            var concertName = data[i].name;

                            $(me.ELEMENTS.SELECT_CONCERT)
                                .append($("<option></option>")
                                .attr("value", concertName)
                                .text(concertName));
                        }
                    },
                    error: function(error) {
                        console.log(error);
                    }
                });
            },

            getConcertName: function() {
                return $(me.ELEMENTS.SELECT_CONCERT).val();
            },

            _updateMap: function() {
                for (var i = 0; i < me.currentConcert.length; i++) {
                    var seat = me.currentConcert[i];

                    $(me.ELEMENTS.CELL_SEAT +
                        '[section="' + seat.section + '"]' +
                        '[row="'     + seat.row     + '"]' +
                        '[seat-no="' + seat.seat_no + '"]')
                        .toggleClass('reserved', true);
                }
            },

            _resetMap: function() {
                $(me.ELEMENTS.CELL_SEAT).toggleClass('reserved', false);
            }
        }; // End me

        function createInstance() {
            $(document).on('change', $(me.ELEMENTS.SELECT_CONCERT), me.updateConcertData);
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