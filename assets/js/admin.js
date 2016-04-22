(function($) {
    window.BBLNSeats = (function () {
        var instance;

        var me = {
            ELEMENTS: {
                SELECT_CONCERT_FORM:  "#form-select-concert",
                SELECT_CONCERT:       '#select-concert',
                CELL_SEAT:            '.seat',
                SECTION:              '.section',
                SEAT_CONTEXT_MENU:    '#seat-context-menu'
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
                        if (!!data) return;
                        if (data.length > 1)
                            throw new Error("getUser(), it looks like there is more than one user on this seat.. :o");
                        successCallback && successCallback(response.data[0]);
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            },

            // TODO Dit moet aangeroepen worden bij submit
            saveToDb: function(reserved) {
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        action:   'bblnseats_saveToDb',
                        reserved: reserved,
                        user_id:  userID
                    },
                    success: function (response) {

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

                        me.updateConcertData();
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

            openSeatContextMenu: function (event) {
                var contextMenu = $(me.ELEMENTS.SEAT_CONTEXT_MENU);

                // Avoid the real one
                event.preventDefault();

                var seat = me.getSeat(
                    $(this).attr('section'),
                    $(this).attr('row'),
                    $(this).attr('seat-no')
                );

                var booked = !!seat;

                // Set menu options
                var menuOptions = {
                    new:    true,
                    open:   false,
                    delete: false
                };

                if (booked) {
                    menuOptions.new    = false;
                    menuOptions.open   = true;
                    menuOptions.delete = true;
                }

                contextMenu.children('#new').toggleClass('disabled', !menuOptions.new);
                contextMenu.children('#open').toggleClass('disabled', !menuOptions.open);
                contextMenu.children('#delete').toggleClass('disabled', !menuOptions.delete);

                // Show context menu
                $(contextMenu)
                    .finish()
                    .toggle(100)
                    .offset({
                        top:  event.pageY,
                        left: event.pageX
                    });
            },

            closeContextMenu: function(event) {
                var container = $(me.ELEMENTS.SEAT_CONTEXT_MENU);

                if (!container.is(event.target) && container.has(event.target).length === 0)
                    container.hide();
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
            $(document).on('contextmenu', me.ELEMENTS.CELL_SEAT, me.openSeatContextMenu);

            // Trigger action when the contexmenu is about to be shown
            $(document).on("contextmenu", me.ELEMENTS.CELL_SEAT, function (event) {

            });


            // If the document is clicked somewhere
            $(document).bind("mousedown", function (e) {

                // If the clicked element is not the menu
                if (!$(e.target).parents(me.ELEMENTS.SEAT_CONTEXT_MENU).length > 0) {

                    // Hide it
                    $(me.ELEMENTS.SEAT_CONTEXT_MENU).hide(100);
                }
            });


            // If the menu element is clicked
            $(".custom-menu li").click(function(){

                // This is the triggered action name
                switch($(this).attr("data-action")) {

                    // A case for each action. Your actions here
                    case "first": alert("first"); break;
                    case "second": alert("second"); break;
                    case "third": alert("third"); break;
                }

                // Hide it AFTER the action was triggered
                $(".custom-menu").hide(100);
            });
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