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

                        me._resetMap();  // TODO Is this necessary?
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
                        if (!data) return;
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
            newBookingToDb: function() {
                var concertID = $(me.ELEMENTS.SELECT_CONCERT + ' option:selected').data('concertID');
                var seat = $(me.ELEMENTS.BOOKING_MODAL).data('seat');
                var user = $(me.ELEMENTS.BOOKING_MODAL).data('user');

                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        action:    'bblnseats_newBookingToDb',
                        section:    seat.section,
                        row:        seat.row,
                        seat_no:    seat.seatNo,
                        concert_id: concertID,
                        user_name:  user.name
                    },
                    success: function (response) {
                        me.currentConcert.push(response.data[0]);
                        me._resetMap();
                        me._updateMap();
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            },

            deleteBooking: function() {
                var concertID = $(me.ELEMENTS.SELECT_CONCERT + ' option:selected').data('concertID');
                var seat = $(me.ELEMENTS.BOOKING_MODAL).data('seat');
                var user = $(me.ELEMENTS.BOOKING_MODAL).data('user');

                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        action: 'bblnseats_deleteBooking',
                        section:    seat.section,
                        row:        seat.row,
                        seat_no:    seat.seatNo,
                        concert_id: concertID,
                        user_name:  user.name
                    },
                    success: function(response) {
                        var bookingID = response.data;
                        if (bookingID < 0) return;

                        var booking = me.currentConcert.filter(function(obj) {
                            return obj.id == bookingID;
                        })[0];

                        var bookingIndex = me.currentConcert.indexOf(booking);
                        if (bookingIndex > -1) {
                            me.currentConcert.splice(bookingIndex, 1);
                        }

                        me._resetMap();
                        me._updateMap();
                    },
                    error: function(error) {
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
                            var concertID   = data[i].id;

                            $(me.ELEMENTS.SELECT_CONCERT)
                                .append($("<option></option>")
                                    .attr("value", concertName)
                                    .text(concertName)
                                    .data('concertID', concertID)
                                );
                        }

                        // Select the first non-placeholder option
                        if (data.length >= 1)  {
                            $(me.ELEMENTS.SELECT_CONCERT + ' option:nth-child(2)').attr('selected', 'selected');
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
                contextMenu.data('reservation', reservation);

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
                // switch ($(this).attr("data-action")) {
                //     case "new":
                //         break;
                //     case "open":
                //         break;
                //     case "delete":
                //         break;
                // }

                $(me.ELEMENTS.SEAT_CONTEXT_MENU).hide(100);
            },

            /**
             * Click handler for opening the booking modal
             * @param event
             */
            openBookingModal: function(event) {
                var modal       = $(me.ELEMENTS.BOOKING_MODAL);
                var option      = $(event.relatedTarget);
                var action      = option.data('action');

                var seat        = $(me.ELEMENTS.SEAT_CONTEXT_MENU).data('seat');
                var reservation = $(me.ELEMENTS.SEAT_CONTEXT_MENU).data('reservation');
                var sectionName = $('.section[section-id="' + seat.section + '"] h3').html();

                var title       = modal.find('#booking-modal-title');
                var nameInput   = modal.find('#modal-input-name');
                var footer      = modal.find('#modal-footer');
                var submitBtn   = modal.find('#modal-submit');

                var modalVars = {
                    title: "",
                    editable: false,
                    footer: false,
                    name: "",
                    submitText: ""
                };

                switch (action) {
                    case "new":
                        modalVars.title = "Reservar nueva plaza";
                        modalVars.editable = true;
                        modalVars.footer = true;
                        modalVars.name = "";
                        modalVars.submitText = "Reservar";
                        break;
                    case "open":
                        modalVars.title = "Reserva";
                        modalVars.editable = false;
                        modalVars.footer = false;
                        modalVars.name = "Cargando ...";
                        break;
                    case "delete":
                        modalVars.title = "Está seguro de que quiere cancelar la reserva?";
                        modalVars.editable = false;
                        modalVars.footer = true;
                        modalVars.name = "";
                        modalVars.submitText = "Aceptar";
                        break;
                    default:
                        console.log("No action named '" + action + "'");
                        return;
                }

                // Massage the modal dom :)
                title.html(modalVars.title);
                nameInput.prop('disabled', !modalVars.editable);
                nameInput.val(modalVars.name);
                footer.css('display', modalVars.footer ? 'block' : 'none');
                submitBtn.html(modalVars.submitText);


                // Set seat
                modal.find('#modal-section-label').html(sectionName);
                modal.find('#modal-row-label').html(seat.row);
                modal.find('#modal-seat_no-label').html(seat.seatNo);

                // Set data that has to be loaded from the server
                if (action === "open" || action === "delete") {
                    me.getUser(reservation.user_id, function(data) {
                        modal.find('#modal-input-name').val(data.name);
                        nameInput.prop('disabled', !modalVars.editable);
                    });
                }

                // Reset any potential previous user data
                modal.data('user', null);

                // Set submit action
                $(modal).data('action', action);

                // Set current seat to modal
                $(modal).data('seat', seat);
            },

            bookingModalSubmit: function() {
                var modal       = $(me.ELEMENTS.BOOKING_MODAL);
                var action      = modal.data("action");

                var user = {
                    name:  modal.find('#modal-input-name').val()
                };

                modal.data('user', user);

                switch (action) {
                    case "new":
                        me.newBookingToDb();
                        break;
                    case "open":
                        console.log("I think you just pushed a button that does not exist ;)");
                        break;
                    case "delete":
                        me.deleteBooking();
                        break;
                    default:
                        console.log("No action named '" + action + "'");
                        return;
                }

                modal.modal('toggle');
            }
        }; // End me

        function createInstance() {
            // Event handler for the concert drop down menu
            $(document).on('change', me.ELEMENTS.SELECT_CONCERT, me.updateConcertData);

            // Event handlers for the context menu
            $(document).on('contextmenu', me.ELEMENTS.CELL_SEAT, me.openSeatContextMenu);
            $(document).on('mousedown', me.closeSeatContextMenu);
            $(document).on('click', me.ELEMENTS.SEAT_CONTEXT_MENU + ' li', me.seatContextMenuClicked);

            // Event handlers for the booking modal
            $(me.ELEMENTS.BOOKING_MODAL).on('show.bs.modal', me.openBookingModal);
            $(me.ELEMENTS.BOOKING_MODAL + ' #modal-submit').click(me.bookingModalSubmit);

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