(function($) {
    window.BBLNSeats = (function () {
        var instance;

        var me = {
            ELEMENTS: {
                SELECT_CONCERT_FORM:  "#form-select-concert",
                SELECT_CONCERT:       '#select-concert',
                CELL_SEAT:            '.seat',
                SECTION:              '.section',
                POPUP_EDIT_SEAT:      '#pop-change-reservation'
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
                        console.log(response.data);
                        me._resetMap();
                        me._updateMap();
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            },

            getUser: function (userID, successCallback) {
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        action: 'bblnseats_getUser',
                        user_id: userID
                    },
                    success: function (response) {
                        var data = response.data;
                        if (data.length > 1)
                            throw new Error("getUser(), it looks like there is more than one user on this seat.. :o");
                        successCallback && successCallback(response.data[0]);
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            },

            updateConcertList: function () {
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    dataType: 'json',
                    data: {action: 'bblnseats_getConcertList'},
                    success: function (response) {
                        var data = response.data;

                        for (var i = 0; i < data.length; i++) {
                            var concertName = data[i].name;

                            $(me.ELEMENTS.SELECT_CONCERT)
                                .append($("<option></option>")
                                .attr("value", concertName)
                                .text(concertName));
                        }
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            },

            getConcertName: function () {
                return $(me.ELEMENTS.SELECT_CONCERT).val();
            },

            getSeat: function(section, row, seat_no) {
                var currentConcert = me.currentConcert;

                for (var i = 0; i < currentConcert.length; i++) {
                    var seat = currentConcert[i];
                    if (seat.section != section) continue;
                    if (seat.row != row)         continue;
                    if (seat.seat_no != seat_no) continue;
                    return seat;
                }

                return null;
            },

            openPopup: function (event) {
                var popup            =  $(me.ELEMENTS.POPUP_EDIT_SEAT);
                var nameInputElement =  popup.find('input[name="name"]');

                var seat = me.getSeat(
                    $(this).attr('section'),
                    $(this).attr('row'),
                    $(this).attr('seat-no')
                );

                // Reset fields
                nameInputElement.val("");

                // If there is a reservation on the clicked seat
                if (!!seat) {
                    me.getUser(seat.user_id, function(user) {
                        nameInputElement.val(user.name);
                    });
                }

                // Place the popup on the correct place and make the popup visible
                popup.offset({
                    top: event.pageY,
                    left: event.pageX
                });
                popup.css('visibility', 'visible');
            },

            closePopup: function (event) {
                var popup = $(me.ELEMENTS.POPUP_EDIT_SEAT);
                if (!popup.is(event.target) && popup.has(event.target).length === 0)
                    popup.css('visibility', 'hidden');
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
            $(document).on('change', me.ELEMENTS.SELECT_CONCERT, me.updateConcertData);
            $(document).on('click', me.ELEMENTS.CELL_SEAT, me.openPopup);
            $(document).on('mousedown', me.closePopup);
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