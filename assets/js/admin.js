(function($) {
    window.BBLNSeats = (function () {
        var instance;

        var me = {
            ELEMENTS: {
                SELECT_CONCERT_FORM:  "#form-select-concert",
                SELECT_CONCERT:       '#select-concert',
                CELL_SEAT:            '.seat',
                SECTION:              '.section',
                SEAT_CONTEXT_MENU:    '#seat-context-menu',
                BOOKING_MODAL:        '#booking-modal'
            },

            currentConcert: null,

            updateConcertData: function () {
                var concertName = $(me.ELEMENTS.SELECT_CONCERT).val();
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

            getReservation: function(section, row, seat_no) {
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
            },


            /**
             * Open the seat context menu.
             * @param event - Only applicable if function used as event handler
             */
            openSeatContextMenu: function (event) {
                // If event is given, avoid the real context menu
                !!event && event.preventDefault();

                var contextMenu = $(me.ELEMENTS.SEAT_CONTEXT_MENU);

                var seat = {
                    section: $(this).attr('section'),
                    row: $(this).attr('row'),
                    seatNo: $(this).attr('seat-no')
                };

                var reservation = me.getReservation(
                    seat.section,
                    seat.row,
                    seat.seatNo
                );

                contextMenu.data('seat', seat);

                var booked = !!reservation;

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

            /**
             * Close the context menu if clicked outside of the menu.
             * @param event - Click event
             */
            closeSeatContextMenu: function(event) {
                // If the clicked element is not the menu
                if (!$(event.target).parents(me.ELEMENTS.SEAT_CONTEXT_MENU).length > 0) {

                    // Hide it
                    $(me.ELEMENTS.SEAT_CONTEXT_MENU).hide(100);
                }
            },

            /**
             * Click handler for clicking on a menu item of the context menu.
             */
            seatContextMenuClicked: function() {
                switch ($(this).attr("data-action")) {
                    case "new":
                        break;
                    case "open":
                        break;
                    case "delete":
                        break;
                }

                $(me.ELEMENTS.SEAT_CONTEXT_MENU).hide(100);
            },

            openBookingModal: function(event) {
                var seat    = $(me.ELEMENTS.SEAT_CONTEXT_MENU).data('seat');
                var option  = $(event.relatedTarget); // Button that triggered the modal
                var action  = option.data('action'); // Extract info from data-* attributes

                var modal     = $(me.ELEMENTS.BOOKING_MODAL);

                var title     =  modal.find('#booking-modal-title');
                var nameInput =  modal.find('#name');
                var footer    =  modal.find('#modal-footer');

                var modalVars = {
                    title: "",
                    editable: false,
                    footer: false
                };

                switch (action) {
                    case "new":
                        modalVars.title = "Reservar nueva plaza";
                        modalVars.editable = true;
                        modalVars.footer = true;
                        break;
                    case "open":
                        modalVars.title = "Reserva";
                        modalVars.editable = false;
                        modalVars.footer = false;
                        break;
                    case "delete":
                        modalVars.title = "Cancelar reserva";
                        break;
                }

                title.html(modalVars.title);
                nameInput.prop('disabled', !modalVars.editable);
                footer.css('display', modalVars.footer ? 'block' : 'none');

                var sectionName = $('.section[section-id="' + seat.section + '"] h3').html();

                // Set seat
                modal.find('#modal-section-label').html(sectionName);
                modal.find('#modal-row-label').html(seat.row);
                modal.find('#modal-seat_no-label').html(seat.seatNo);


                // // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
                // // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
                // var modal = $(this);
                // modal.find('.modal-title').text('New message to ' + recipient);
                // modal.find('.modal-body input').val(recipient);
            }
        }; // End me

        function createInstance() {
            // Event handler for the concert drop down menu
            $(document).on('change', me.ELEMENTS.SELECT_CONCERT, me.updateConcertData);

            // Event handlers for the context menu
            $(document).on('contextmenu', me.ELEMENTS.CELL_SEAT, me.openSeatContextMenu);
            $(document).on('mousedown', me.closeSeatContextMenu);
            $(document).on('click', me.ELEMENTS.SEAT_CONTEXT_MENU + ' li', me.seatContextMenuClicked);

            // Event handler for when the booking modal shows up
            $(me.ELEMENTS.BOOKING_MODAL).on('show.bs.modal', me.openBookingModal);

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