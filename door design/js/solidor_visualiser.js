var solidor_visualiser = (function (_module) {

    var $modal;

    _module.Init = function () {
        wireEvents();
        image_uploading();
    };

    var wireEvents = function () {
        $("#launch-visualiser").on("click", launchVisualiser);
        $("body").on("click", "[data-stock-image]", setBackground);
        $("body").on("click", "#sendVisualisationEmail", flattenImage);
    };

    var launchVisualiser = function () {
        $.ajax({
            method: "GET",
            url: "/visualiser",
        }).done(function (resp) {

            $("body").append(resp);

            $modal = $("#visualiser-modal");

            $modal.fadeIn();

            $modal.find(".visualiser_modal-close").on("click", function () {
                $modal.fadeOut(function () {
                    $modal.remove();
                });
            });

        });
    };

    var setBackground = function () {
        $.ajax({
            method: "POST",
            url: "/visualiser",
            data: {
                bg_img: $(this).data("stock-image"),
                product_img: designer.img_paths.external
            }
        }).done(function (resp) {
            $modal.find(".visualiser_modal-content").html(resp);
        });
    };

    var image_uploading = function () {

        var error_message = "Please ensure the file you're trying to upload is a valid image that's less that 2MB";
        var allow_submit = false;

        $("body").on("click", "#visualiser_upload-input", function () {
            $("#input_visualiserUpload").trigger("click");
        });

        $("body").on("change", "#input_visualiserUpload", function (e) {
            $("#visualiser_error_holder").html("").fadeOut();
            var fileName = e.target.files[0].name;
            $("#file_chosen").html(fileName);

            if (e.target.files[0].size >= 1999990 || e.target.files[0].type.split('/')[0] != 'image') {
                allow_submit = false;
            } else {
                allow_submit = true;
            }
        });

        $("body").on('submit', "#visualiser-upload", (function (e) {
            e.preventDefault();

            if (allow_submit){
                $.ajax({
                    url: '/visualiser-upload',
                    type: "POST",
                    data: new FormData(this),
                    contentType: false,
                    cache: false,
                    processData: false,

                    success: function (resp) {
                        $.ajax({
                            method: "POST",
                            url: "/visualiser",
                            data: {
                                bg_img: resp,
                                product_img: designer.img_paths.external
                            }
                        }).done(function (resp) {
                            $modal.find(".visualiser_modal-content").html(resp);
                        });
                    }
                }).fail(function (resp) {
                    $("#visualiser_error_holder").html(error_message).fadeIn();
                });
            } else {
                $("#visualiser_error_holder").html(error_message).fadeIn();
            }

        }));
    };

    var flattenImage = function () {
        var name = $("#visualisationEmail_name").val();
        var email = $("#visualisationEmail_email").val();

        if (name == "" || email == "") {

            $("#visualisationEmail_name").css("border", "1px solid red");
            $("#visualisationEmail_email").css("border", "1px solid red");

        } else {

            var $form = $(".visualiser_send").clone();

            $(".visualiser_send").animate({
                left: "-5000px"
            }, "slow", function(){
                $(".visualiser_send").remove();
                $("#visualiser_send-message").html(
                    "<img src='/images/ajax.gif'/><h1 class='overlay-loader'>Sending...</h1>"
                ).show().animate({
                    top: "0px"
                }, "slow");
            });

            $.ajax({
                method: "POST",
                url: "/visualiser-flatten-image",
                data: {
                    bg_img: visualiser.settings.bgimg,
                    product_img: visualiser.settings.product.img,
                    product_width: visualiser.settings.product.width,
                    product_height: visualiser.settings.product.height,
                    position_top: visualiser.settings.product.top,
                    position_left: visualiser.settings.product.left
                }
            }).success(function (image) {
                sendEmail(image, name, email, $form);
            });
        }
    };

    var sendEmail = function (image, name, email, $form) {

        var summary = getSummmary();

        $.ajax({
            method: "POST",
            url: "/sendVisualisationEmail",
            data: {
                image: image,
                name: name,
                email: email,
                summary: summary,
                vendor: $('input[name="vendor_id"]').val()
            }
        }).done(function (resp) {

            $("#visualiser_send-message").animate({
                top: "5000px"
            }, "slow", function(){
                $("#visualiser_send-message").html(
                    "<h1>Your visualisation is on it's way!</h1>"
                ).show().animate({
                    top: "0px"
                }, "slow").delay(1500).fadeOut(function(){
                    $("#visualiser_send-message").html("");
                    $form.css("left", "0px").css("top", "5000px");
                    $(".visualiser_modal-content").append($form);
                    $form.animate({
                        top: "0px"
                    }, "slow");
                });
            });

        });
    };

    var getSummmary = function(){

        var visualiser_summary = {
            "EntranceType": designer.selected_option('entrance_type_id').EntranceType,
            "FrameStyle": designer.selected_option('frame_id').FrameName,
            "FrameColourExternal": designer.selected_option('frame_external_colour_id').ColourName,
            "FrameColourInternal": designer.selected_option('frame_internal_colour_id').ColourName,
            "DoorStyle" : designer.selected_option('slab_id').DoorName,
            "ExternalColour": designer.selected_option('door_external_colour_id').ColourName,
            "InternalColour": designer.selected_option('door_internal_colour_id').ColourName,
            "Glass": designer.selected_option('door_glass_id').GlassName,
            "ExternalHandle": designer.selected_option('external_handle_id').Accessory,
            "InternalHandle": designer.selected_option('internal_handle_id').Accessory,
            "Accessories": [designer.selected_option('knocker_id').Accessory, designer.selected_option('spyhole_id').Accessory, designer.selected_option('letterplate_id').Accessory]
        };

        return visualiser_summary;

    };

    return _module;
}(solidor_visualiser || {}));