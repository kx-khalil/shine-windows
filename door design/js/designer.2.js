/**
 * Created by Dan on 16/12/2015.
 */

function first(obj) {
    for (var a in obj) return obj[a];
}

function count(amt) {
    var c = 0;
    for (var a in amt) c++;
    return c;
}

function indexOf(xvar, array) {
    var counter = 0;
    for (var i in array) {
        if (array[i] == xvar)
            return counter;
        counter++;
    }
    return -1;
}

function array_contains(arr, value) {

    for (var i in arr) {
        if (arr[i].toString() == value.toString() || i == value)
            return true;
    }
    return false;
}

designer = {
    current_json: null,
    current_step: null,
    rule_override: null,
    filter_ignore: [],
    ajax_handle: null,
    img_flipped: false,
    current_stage: 0,
    img_view: 'external',
    requires_image_update: true,
    current_tab: null,
    summary_open: false,
    stage_index: 0,
    save_title: 0,
    visited: [],
    img_paths: {
        external: {},
        internal: {},
    },

    ignore_filter: function (filter) {
        designer.filter_ignore.push(filter);
    },

    clear_ignores: function () {
        designer.filter_ignore = [];
    },

    next_step: function () {
        var nv = null;

        $('.intro-text').hide();

        var breakLoop = false;
        if ($('.designer-tabs').css('display') != 'none') {
            $.each($('.designer-tabs a'), function (key, val) {
                if ($(this).hasClass('active')) {
                    var next = $(this).next('a');
                    if (next.length > 0 && next.css('display') != 'none') {
                        next.trigger('click', null);
                        breakLoop = true;
                        return false;
                    }
                }
            });
            if (breakLoop)
                return;
        }
        var current_stage = designer.current_stage;
        $('.mobnav-left span').animate({
            'left': '400px'
        }, function () {
            $('.mobnav-left span').css('left', 0);
            $('.mobnav-left span').css('left', '-400px');
            setTimeout(function () {
                $('.mobnav-left span').animate({
                    'left': '8px'
                });
                $('.mobnav-left span').html(designer.save_title);
            }, 1)


        });
        for (var i in current_stage.menus) {

            if (nv != 1 && current_stage.menus[i].disabled != undefined && current_stage.menus[i].disabled == true) {
                if (designer.current_step == current_stage.menus[i]) {
                    nv = 1;
                    continue;
                }
                continue;
            }



       //     alert(i);
            
            var ignore = [ 19, 54, 23, 48, 33];
            var con = false;
            for(var k in ignore) {
                if(i == 'accessories' && ignore[k] == parseInt(designer.val('slab_id'))) {
                    con = true;
                    break;
                }
            }
            if(con)
                continue;
           

            var foundOne = false;
            for (var cx in current_stage.menus[i].tabs) {

                if (current_stage.menus[i].tabs[cx].load_type == 'carousel') {
                    if (designer.current_json[current_stage.menus[i].tabs[cx].load_base] == undefined) {
                        continue;
                    }

                    if (eval(designer.current_json[current_stage.menus[i].tabs[cx].load_base].filter)) {
                        foundOne = true;
                        break;
                    }
                } else {
                    foundOne = true;
                }


            }
            if (!foundOne)
                continue;

            if (nv == 1) {
                designer.load_menu(current_stage.menus[i]);
                return;
            }
            if (designer.current_step == current_stage.menus[i]) {
                nv = 1;
                continue;
            }
        }
        designer.current_stage.on_complete();
    },

    prev_step: function () {
        $('.mobnav-left span').animate({
            'left': '-400px'
        }, function () {
            $('.mobnav-left span').css('left', 0);
            $('.mobnav-left span').css('left', '400px');
            setTimeout(function () {
                $('.mobnav-left span').animate({
                    'left': '8px'
                });
                $('.mobnav-left span').html(designer.save_title);
            }, 1)
        });
        var nv = null;
        var current_stage = designer.current_stage;

        for (var i in current_stage.menus) {

            var ignore = [ 19, 54, 23, 48, 33];

            var con = false;
            
            for(var k in ignore) {
                if(i == 'accessories' && ignore[k] == parseInt(designer.val('slab_id'))) {
                    con = true;;
                }
            }
            if(con)
                continue;
            
            
            if (current_stage.menus[i].disabled != undefined && current_stage.menus[i].disabled == true && nv != null) {
                if (designer.current_step == current_stage.menus[i] && nv != null) {
                    designer.load_menu(nv);
                    return;
                }
                continue;
            }

            if (designer.current_step == current_stage.menus[i] && nv != null) {
                designer.load_menu(nv);
                return;
            }
            nv = current_stage.menus[i];
        }
        alert("fatal error");
    },

    has_prev: function () {
        var nv = null;
        var current_stage = designer.current_stage;

        for (var i in current_stage.menus) {
            if (designer.current_step == current_stage.menus[i] && nv != null) {
                return true;
            }
            nv = current_stage.menus[i];
        }
        return false;
    },
    selected_extra: function (key) {
        var value = designer.val('extra_' + key);
        if (designer.current_json[key] == undefined)
            return undefined;

        var options = designer.current_json[key].extra_dropdown.options;
        for (var option_key in options) {
            if (options[option_key].value == value) {
                return options[option_key];
            }
        }
        return undefined;
    },

    selected_option: function (key) {

        var value = designer.val(key);
        if (designer.current_json[key] == undefined)
            return undefined;

        var options = designer.current_json[key].options;
        for (var option_key in options) {
            if (options[option_key].value == value) {
                return options[option_key];
            }
        }
        return undefined;
    },


    option_for_val: function (key, val) {

        if (designer.current_json[key] == undefined)
            return undefined;

        var options = designer.current_json[key].options;
        for (var option_key in options) {
            if (options[option_key].value == val) {
                return options[option_key];
            }
        }
        return undefined;
    },

    loadJSON: function (url, callback) {
        $('#loading-menu').fadeIn(300);
        $('.control-panel').hide();
        $.getJSON(url, function (response) {
            callback(response);
            $('#loading-menu').fadeOut(300);
            $('.control-panel').show();
        });
    },

    loadBackgroundJSON: function (url, callback) {
        $.getJSON(url, function (response) {
            callback(response);
        });
    },

    set_val: function (key, val) {
        if ($('input[name="' + key + '"]').val() != val) {
            designer.requires_image_update = true;
            $('input[name="' + key + '"]').val(val);
            designer.get_image();
        }
    },

    val: function (val) {

        return $('input[name="' + val + '"]').val();
    },

    is_val: function (val, value) {
        return designer.val(val) == value;
    },

    in_set: function (option, option_list, value) {
        value = "" + value;
        if (option === undefined) {
            return false;
        }
        var set = option[option_list];
        return $.inArray(value, set) != -1;
    },

    change_banner: function (target) {
        $('.infobanner-target').html($(target).html());
    },


    rebuild_tabs: function () {
        var menu = designer.current_step;
        var valid_tabs = [];
        for (var i in menu.tabs) {
            if (designer.current_json == null) {
                valid_tabs[i] = menu.tabs[i];
                continue;
            }
            if (menu.tabs[i].load_type != 'carousel') {
                valid_tabs[i] = menu.tabs[i];
            }
            if (designer.current_json == null || designer.current_json[menu.tabs[i].load_base] == undefined)
                continue;

            if (menu.tabs[i].load_type != 'carousel' || eval(designer.current_json[menu.tabs[i].load_base].filter)) {
                valid_tabs[i] = menu.tabs[i];
            }
        }

    },


    is_override: function (type_id, search_id, check_against) {
        var search = 'check_from';
        var search_in = 'keys';
        var search_other = 'ruleables';
        var search_against = 'check_against'

        var found_array = null;
        for (var i in designer.rule_override) {
            if (designer.rule_override[i][search] == type_id) {
                found_array = designer.rule_override[i];
                break;
            }
        }
        // No override rules found.
        if (found_array == null) {
            return true;
        }

        var found_rule = null;

        for (var i in found_array.rules) {
            for (var x in found_array.rules[i][search_in]) {
                if (search_id == found_array.rules[i][search_in][x]) {
                    found_rule = found_array.rules[i];
                    break;
                }
            }
        }

        if (found_rule == null) {
            return true;
        }

        for (var i in found_rule[search_other]) {
            if (found_rule[search_other][i] == designer.val(found_array[search_against])) {
                return false;
            }
        }
        
        return true;
    },

    check_london_letterplate_rule: function () {
        var hide_letterplate = false;
        var hide_knocker = false;
        if (designer.val('slab_id') == 56) {
            if (designer.val('knocker_id') != 56 || designer.val('spyhole_id') != 57) {
                hide_letterplate = true;
            }

            if (designer.val('letterplate_id') != 59)
                hide_knocker = true;

            $.each($('.slider a'), function (key, val) {
                if ($(this).attr('formcategory') == 'letterplate_id') {
                    if (hide_letterplate)
                        $(this).hide();
                    else
                        $(this).show();
                }
                var cat = $(this).attr('formcategory');
                if (cat == 'spyhole_id' || cat == 'knocker_id') {
                    if (hide_knocker)
                        $(this).hide();
                    else
                        $(this).show();
                }
            });
        }
    },

    set_view: function (view) {
        designer.img_view = view;
        designer.view_side = view;
    },

    load_menu: function (menu) {
        designer.set_view('external');
        $('.summary').animate({
            left: '-' + designer.summary_margin() + "%"
        });

        $('.normalize').removeClass('normalize');
        $('.carousel-right').hide();
        $('#notify').hide();
        designer.current_step = menu;
        designer.visited.push(menu);

        if (menu.hide_image != undefined) {
            $('.doorimg img').hide();
            $('.doorimg').hide();

        } else {
            designer.get_image();
            $('.doorimg').show();
        }

        var valid_tabs = [];
        var invalid_tabs = [];
        var invalid_count = 0;
        for (var i in menu.tabs) {
            if (designer.current_json == null) {
                valid_tabs[i] = menu.tabs[i];
                continue;
            }
            if (menu.tabs[i].load_type != 'carousel') {
                valid_tabs[i] = menu.tabs[i];
            }
            if (designer.current_json == null || designer.current_json[menu.tabs[i].load_base] == undefined)
                continue;

            if (menu.tabs[i].load_type != 'carousel' || eval(designer.current_json[menu.tabs[i].load_base].filter)) {
                valid_tabs[i] = menu.tabs[i];
            } else {
                invalid_tabs[i] = menu.tabs[i];
            }
        }

        if (designer.has_prev()) {
            if (!designer.mobile()) {
                $('#next-btn').css('float', 'none').css('display', 'inline-block');
                ;
            } else {
                $('#next-btn').css('float', 'left').css('display', 'inline-block');
                ;

            }
            $('#prev-btn').show().css('display', 'inline-block');


        } else {

            $('#prev-btn').hide();
            if (designer.mobile()) {
                $('#next-btn').css('float', 'right');
            }
        }

        if (menu.notify != undefined) {
            $('#notify').html(menu.notify);
            $('#notify').show();
        }
        var img = menu.background_image = '/images/woodgrain-bg.jpg';
        $('.designerright').css('background-image', 'url(/images/woodgrain-bg.jpg)');
        $('.designer-bg-container').hide();
        //$('.designer-bg-container').animate({
        //    'opacity': '0.7'
        //}, 400, function () {
        //    $('.designer-bg-container').animate({
        //        'opacity': '0.0'
        //    }, 400);
        //    $('.designerright').css('background-image', 'url(' + img + ')');
        //    $('.designerright').css('background-color', 'white');
        //
        //
        //});
        if (!designer.mobile()) {
            $('.details').fadeOut(400, function () {
                $('.details h1').html(menu.title);
                $('.details p').html(menu.sub_heading);
                $('.details').fadeIn(400);
            });
        } else {
            $('.details h1').html(menu.title);
            $('.details p').html(menu.sub_heading);
        }
        if (designer.mobile())
            designer.save_title = menu.mob_title;
        else
            designer.save_title = menu.title;

        if (menu.banner_target != undefined) {
            $('.infobanner-target').html($(menu.banner_target).html());
        } else {
            // $('.infobanner-target').html(' ');
        }
        var is_hidden = false;
        if (count(valid_tabs) == 1 && !designer.mobile()) {
            is_hidden = true;
            $('.designer-tabs').hide();
        }

        if (!is_hidden)
            $('.designer-tabs').show();


        var html = '';


        for (var tab_index in valid_tabs) {
            html += '<a href="javascript:void(0)" data-tab="' + tab_index + '">' + menu.tabs[tab_index].label + '</a>';
        }

        for (var tab_index in invalid_tabs) {
            html += '<a style="display: none" href="javascript:void(0)" data-tab="' + tab_index + '">' + menu.tabs[tab_index].label + '</a>';
        }

        $('.designer-tabs').html(html);
        if (designer.mobile()) {
            if (count(valid_tabs) == 1) {
                $('.designer-tabs a').hide();
                $('.designer-tabs').hide();

                $('.carousel-area.carousel-left').css('margin-top', 0);
            } else {
                $('.designer-tabs a').removeClass('tab-100');
                if (designer.mobile()) {
                    $('.carousel-area.carousel-left').css('margin-top', '43px');
                }
            }
        }
        $('.designer-tabs a').click(function (event) {
            event.preventDefault();
            var tab = $(this).attr('data-tab');
            designer.load_options(designer.current_step.tabs[tab], $('.carousel-left'), function (clicked) {
                designer.current_option = clicked;
            });
            designer.current_tab = designer.current_step.tabs[tab];

            if (designer.current_tab.onselect != undefined) {
                designer.current_tab.onselect();
            }
            if (designer.current_tab.flip_view != undefined) {
                designer.set_view('internal');
                designer.img_flipped = true;
            } else {
                if (designer.img_view == 'internal')
                    designer.img_flipped = true;
                designer.set_view('external');
            }
            designer.get_image();

            if (menu.onload != undefined) {
                menu.onload();
            }
            $('.designer-tabs a').removeClass('active');
            $(this).addClass('active');
            tab = null;
        });

        $('.designer-tabs a').first().addClass('active');


        try {
            designer.load_options(first(valid_tabs), $('.carousel-left'), function (clicked) {
                designer.current_option = clicked;
            });
        } catch (e) {

        }

        designer.current_tab = first(valid_tabs);

        designer.rebuild_menu('load menu');
        if (menu.onload != undefined) {
            menu.onload();
        }
    },


    load_options: function (menu, target, callbacks) {

        target.html('');
        switch (menu.load_type) {
            case 'html':
                $.ajax(menu.load_url).done(function (result) {
                    target.html(result);
                });
                break;

            case 'multi-option-carousel':
                var carousel = new Carousel('xnull');

                for (var menu_name in menu.load_base) {
                    if (!eval(designer.current_json[menu_name].filter)) {
                        continue;
                    }

                    var data = designer.current_json[menu_name].options;
                    target.html('<div class="generic-carousel"><div class="slider"></div></div>');
                    target = $('.slider');

                    for (var option_key in data) {
                        var option = data[option_key];
                        var br = false;

                        for (var key in option.rules) {
                            if (!array_contains(option.rules[key].rule, designer.filter_ignore)) {
                                if (!eval(option.rules[key].rule) || !designer.is_override(menu_name, option.value)) {
                                    br = true;
                                    break;
                                }
                            }
                        }

                        if (!br) {
                            if (option['sg_order'] != '-1') {
                                if (option.sg_category != undefined && option.sg_category != null) {

                                    if (!eval(option.sg_category)) {
                                        continue;
                                    }
                                }

                                var thumb = option.thumbnail;

                                if (menu.replace_path != undefined) {
                                    thumb = option.thumbnail.replace('https://cloud.solidor.co.uk', '');
                                }

                                if ($.inArray(parseInt(option.value), menu.ignore_items) > -1) {
                                    continue;
                                }

                                var json_array = {
                                    'data-option': option_key,
                                    formcategory: menu_name
                                };

                                for (var i in menu.load_base[menu_name]) {
                                    json_array[i] = menu.load_base[menu_name][i];
                                }

                                var fill = menu.fill_image != undefined && mobile ? true : false;
                                json_array[fill] = fill;


                                carousel.add((menu.hide_text == undefined ? option.label : ''), option.value, thumb, json_array);
                            }
                        }
                    }
                }

                carousel.build($(target), function (result, result2, jquery) {
                    if (jquery.data('callback-action') != undefined)
                        eval(jquery.data('callback-action'));


                    designer.get_image();
                    designer.check_london_letterplate_rule();
                    designer.rebuild_menu();
                });
                break;

            case 'carousel':
            case 'generic-carousel':
            case 'multi-option-carousel':

                var data = designer.current_json[menu.load_base].options;
                target.html('<div class="generic-carousel"><div class="slider"></div></div>');
                target = $('.slider');

                var carousel;
                if (menu.descriptive == undefined)
                    carousel = new Carousel(menu.load_base, {
                        pad: menu.pad
                    });
                else
                    carousel = new Carousel(menu.load_base, {
                        pad: menu.pad
                    });

                for (var option_key in data) {
                    var option = data[option_key];
                    var br = false;


                    for (var key in option.rules) {
                        if (!array_contains(designer.filter_ignore, option.rules[key].rule)) {
                            if (!eval(option.rules[key].rule) || !designer.is_override(menu.load_base, option.value)) {
                                br = true;
                                break;
                            }
                        }
                    }

                    if (!br) {
                        if (option['sg_order'] != '-1') {
                            if (option.sg_category != undefined && option.sg_category != null) {

                                if (!eval(option.sg_category)) {
                                    continue;
                                }
                            }

                            var fill = menu.fill_image != undefined && designer.mobile() ? true : false;


                            if (menu.replace_path != undefined) {
                            	var thumb = option.thumbnail.replace('https://cloud.solidor.co.uk', 'door_colours');
                                carousel.add((menu.hide_text == undefined ? option.label : ''), option.value, thumb, {
                                    'data-option': option_key,
                                    'fill': fill
                                });
                            } else {
                                carousel.add((menu.hide_text == undefined ? option.label : ''), option.value, option.thumbnail, {
                                    'data-option': option_key,
                                    'fill': fill
                                });
                            }
                        }
                    }
                }
                carousel.build(target, function (key, val, jquery) {
                    var option = (designer.current_json[key].options[jquery.attr('data-option')]);
                    if (jquery.data('callback-action') != undefined) {
                        eval(jquery.data('callback-action'));
                    }
                    if (option["requires-extra-option"] == true) {
                        var current_val = designer.val('extra_' + key);
                        var found = false;
                        for (var i in option["show-extras"]) {
                            if (option["show-extras"][i] == current_val) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            designer.set_val('extra_' + key, option["show-extras"][0]);
                        }
                    }

                    if (menu.onchange != undefined) {
                        menu.onchange(key, val, jquery);
                    }
                    if (callbacks != null) {
                        callbacks(option);
                    }
                    designer.validate_glass();
                    if(designer.current_json['slab_id'] != null) {
                        if (designer.selected_option('slab_id') != null) {
                            if (designer.selected_option('slab_id')['Range'] == 'italia') {
                                designer.set_val('door_collection_id', 2);

                            } else {
                                designer.set_val('door_collection_id', 1);

                            }
                        }
                    }

                    designer.get_image();
                    designer.rebuild_menu('carousel callback..');
                });
                break;
        }
    },

    ensure_consistency: function (option_type) {
        if (designer.current_json == null || designer.current_json[option_type] == undefined)
            return;
        var firstAvailable = null;
        var totCount = 0;
        for (var option_index in designer.current_json[option_type].options) {
            var hasFailed = false;
            var accepted = [];
            if (designer.current_json[option_type].options[option_index].sg_order == -1)
                continue;
            var option = designer.current_json[option_type].options[option_index];
            for (var rule in option.rules) {
                if (!eval(option.rules[rule].rule)) {
                    hasFailed = true;

                    break;
                }
            }
            if (hasFailed == true) {
                continue;
            }

            if (designer.current_json[option_type].options[option_index].value == designer.val(option_type)) {
                firstAvailable = designer.val(option_type);
                break;
            }

            if (firstAvailable == null)
                firstAvailable = designer.current_json[option_type].options[option_index].value;
        }

        if (firstAvailable != null)
            designer.set_val(option_type, firstAvailable);
    },

    session: function(url) {
        return url + '?sid='+$('input[name="session_id"]').val();
    },

    initialize: function () {

        var first_stage = first(engine_config);
        designer.current_stage = first_stage;
        designer.stage_index = indexOf(designer.current_stage, engine_config);
        var first_menu = first(first(first_stage));
        designer.current_step = first_menu;
        designer.loadJSON('https://cloud.solidor.co.uk/sg/frames', function (result) {
            designer.current_json = {
                frame_id: {
                    filter: true,
                    options: result
                }
            };

            $('.styleoptions div a ').css('opacity', '0.1');
            $('.intro-text h1').animate({'margin-left': 0}, 500, function () {
                $('.intro-text h3').animate({'margin-left': 0}, 500, function () {
                    var leng = ((($('.designeroptions').offset().top - $('.intro-text').offset().top)) - $('.intro-text').outerHeight() / 2) - 50;
                    $('.intro-text').animate({'margin-top': leng + 'px'}, 300, function () {
                        ;
                        var counter = 1;
                        $.each($('.styleoptions div a'), function (key, val) {
                            var ourRef = $(this);
                            setTimeout(function () {
                                ourRef.animate({'opacity': 1}, 500);
                                $('.tooltip').fadeIn(400);
                            }, (++counter *(100)));
                        });


                        });
                });
            });
        });


        designer.loadBackgroundJSON('/local-rules', function (result) {
            designer.rule_override = result;
        });
        designer.load_menu(first_menu);
        designer.load_events();
        designer.rebuild_menu('initalize');
        // Preload images..

        for (var vx in engine_config) {
            for (var x in engine_config[vx].menus) {
                for (var b in engine_config[vx].menus[x]) {
                    if (engine_config[vx].menus[x].background_image !== 'variable' && engine_config[vx].menus[x].background_image !== undefined){
                        var img = new Image();
                        img.src = engine_config[vx].menus[x].background_image;
                        engine_config[vx].menus[x].img = img;
                    }
                }
            }
        }


        // var img = new Image();
        // img.src = 'images/background/contemporarydoors-bg.jpg';
        // designer.bg_images.push(img);
        // img = new Image();
        // img.src = 'images/background/traditionaldoors-bg.jpg';
        // designer.bg_images.push(img);
        // img = new Image();
        // img.src = 'images/background/stabledoors-bg.jpg';
        // designer.bg_images.push(img);


    },

    bg_images: [],


    load_events: function () {
        $('#next-btn').click(function (e) {
            e.preventDefault();
            designer.next_step();
        })
        $('#prev-btn').click(function (e) {
            e.preventDefault();
            designer.prev_step();
        });

        $('#mobnav-show').click(function (e) {
            $('.mobnav-fixed').animate({
                'right': 0
            });
        });

        $('.mobnav-closeaction').click(function (e) {
            $('.mobnav-fixed').animate({
                'right': '-199px'
            });
        });

        $('.doorimg img, .mobimg img').load(function () {
            $(this).fadeIn(100);
        });


        $('#view-side').click(function (event) {
            event.preventDefault();
            if (designer.view_side == 'internal') {
                designer.set_view('external');
                $(this).find('span').html('VIEW INSIDE');
            } else {
                designer.set_view('internal');

                $(this).find('span').html('VIEW OUTSIDE');
            }

            $('.doorimg img').addClass('coolflip');
            setTimeout(function () {
                $('.doorimg img').attr('src', designer.img_paths[designer.view_side]);
                $('.doorimg img').removeClass('coolflip');
            }, 900);
        });

        $('.ins-view').click(function (e) {
            designer.set_view('internal');
            $('.out-view').removeClass('active');
            $(this).addClass('active');

            $('.mobimg img').attr('src', designer.img_paths[designer.view_side]);
        })

        $('.out-view').click(function (e) {
            designer.set_view('external');
            $('.ins-view').removeClass('active');
            $(this).addClass('active');
            $('.mobimg img').attr('src', designer.img_paths[designer.view_side]);
        })

        $('#sum-btn, #mob-sum, .summary-close a, #closesum, .close-sum').click(function (event) {
            event.preventDefault();
            if (designer.summary_open)
                $('.summary').animate({
                    left: '-' + designer.summary_margin() + "%"
                });
            else
                $('.summary').animate({
                    left: 0
                });

            if (!designer.summary_open)
                $(this).find('span').html('Hide summary');
            else
                $(this).find('span').html('Show summary');


            designer.summary_open = !designer.summary_open;
        });

        $('.back-to-edit').click(function (e) {
            $('.summary-max').animate({
                'left': '-100%'
            });
            designer.current_step = engine_config.stage_2.menus.door_style;
            designer.load_menu(designer.current_step);
        });

        $('#viewdoor, #backdesign, #viewdoor-sum').click(function (e) {
            var selector = $('.doorloc');
            if (selector.hasClass('mobile-show')) {
                selector.removeClass('mobile-show');
                $('.designeroptions').show();
                $('.designerbuttonsr').show();

                $('.designer-viewdoor-mobile').hide();

            } else {
                $('.designerbuttonsr').hide();
                $('.designeroptions').hide();
                $('.designer-viewdoor-mobile').show();
                selector.addClass('mobile-show');

            }
        });
    },

    go_summary: function () {
        $('.summary').animate({
            left: 0
        });
        $('.summary').animate({
            width: '100%'
        });
    },

    sessionurl: function (xvar) {
        return xvar;
    },

    hide_nav: function () {
        //  $('.xnav').hide();
    },
    show_nav: function () {
        //     $('.xnav').show();
    },

    validate_glass: function () {
        if (!designer.in_set(designer.selected_option('slab_id'), 'glass-allowed', designer.val('door_glass_id'))) {
            designer.set_val('door_glass_id', 6);
        }
    },

    email: function () {
        designer.ajax_handle = $.post(designer.sessionurl('https://cloud.solidor.co.uk/sg/email'), $('#mainForm').serializeArray(), function (response) {
            alert(JSON.stringify(response));

        });
    },

    validate: function () {
        designer.ajax_handle = $.post(designer.sessionurl('https://cloud.solidor.co.uk/sg/validate'), $('#mainForm').serializeArray(), function (response) {
            alert(JSON.stringify(response));

        });
    },
    get_image: function (callback) {
        if (!designer.requires_image_update) {
            designer.process_images();
            return;
        }
        else
            designer.requires_image_update = false;

        $('#viewdoor img').addClass('blink_me');

        setTimeout(function () {
            $('#viewdoor img').removeClass('blink_me');
        }, 1500);

        if (designer.ajax_handle != null)
            designer.ajax_handle.abort();

        designer.ajax_handle = $.post(designer.sessionurl('https://cloud.solidor.co.uk/sg/image'), $('#mainForm').serializeArray(), function (response) {
            designer.ajax_handle = null;
            designer.img_paths.external = response.url;
            designer.img_paths.internal = response.inside_url;

            var img = $('.doorimg img, .mobimg img');
            $('.image-left img').attr('src', response.url);
            $('.image-right img').attr('src', response.inside_url);
            $('.doorimg').removeClass('.coolflip').removeClass('.coolflip-back');

            designer.process_images();

        });
    },

    process_images: function () {
        if (designer.img_flipped) {
            designer.img_flipped = false;
            $('.doorimg img').addClass('coolflip');
            setTimeout(function () {
                $('.doorimg img').attr('src', designer.img_paths[designer.img_view]);
                $('.doorimg img').removeClass('coolflip');
            }, 900);
        } else {

            $('.doorimg img, .mobimg img').attr('src', designer.img_paths[designer.img_view]).on('load', function () {

            });
        }
    },

    rebuild_summary: function () {
        $('.sum-table').empty();
        var table = $('.sum-table');
        $.each(summary_options, function (key, val) {
            table.append('<tr><td colspan="2" class="sum-title">' + val.label + '</td><td></td></tr>');

            $.each(val.data, function (ikey, ival) {
                if (designer.name(ival.key) != 'Not selected')
                    table.append('<tr><td class="sum-label">' + ival.name + '</td><td>' + designer.name(ival.key) + '</td></tr>');
            });
        });

        var per_row = 6;
        var completed = [];
        var count = 0;
        $.each($('.listnode'), function (key, val) {
            var html = "";
            for (var cx in summary_options) {
                for (var i in summary_options[cx].data) {
                    if ($.inArray(summary_options[cx].data[i], completed) !== -1) {
                        continue;

                    }
                    html += '<span class="title">' + summary_options[cx].data[i].name2 + '</span>';
                    html += '<span class="value">' + designer.name(summary_options[cx].data[i].key) + '</span>';
                    completed.push(summary_options[cx].data[i]);
                    count++;
                    if (count == per_row) {
                        $(this).html(html);
                        count = 0;
                        return true;
                    }
                }
            }
            $(this).html(html);
        });
    },

    name: function (name) {
        if (designer.current_json == null)
            return 'Not selected';
        var test = designer.selected_option(name);
        if (name.indexOf('extra_') != -1) {
            test = designer.selected_extra(name.substring(6));
        }
        if (test == undefined)
            return "Not selected";
        return test.label;
    },

    mobile: function () {
        var width = document.body.clientWidth;
        return width <= 767;
    },

    tablet: function () {
        var width = document.body.clientWidth;
        return width <= 993;
    },

    screen_width: function () {
        return document.body.clientWidth;
    },

    animate_carousel: function (target) {
        target.scrollLeft(150000);
        target.css('opacity', 0.2);
        //target.animate({
        //    scrollLeft: 150000,
        //}, 0);
        //
        target.scrollLeft(150000);

        target.animate({
            scrollLeft: 0, opacity: 1
        }, 900);
    },

    summary_margin: function () {
        if (designer.screen_width() < 767)
            return "100";
        if (designer.screen_width() > 1208)
            return "20";
        else
            return "33";
    },

    recolour_handles: function (to) {

        var Colour = null;
        $.each($('.carousel-left .slider a'), function (key, value) {
            var img = $(this).find('img');
            var toColour = designer.colour_match(to, 'external_handle_id', $(this).attr('data-val'));
            Colour = toColour;
            var src = 'designer/handle-img/' + $(this).attr('data-val') + '/' + toColour;
            $(this).data('callback-action', 'designer.set_val("extra_external_handle_id", ' + toColour + '); designer.set_val("extra_internal_handle_id", ' + toColour + ')');

            if (img.attr('src') != src)
                img.attr('src', src);
        });
        designer.fix_hinges();
    },

    fix_hinges: function () {

        //   designer.set_val('extra_hinge_id',  designer.colour_match(designer.val('extra_external_handle_id'), 'extra_hinge_id', designer.val('extra_hinge_id')));

    },

    recolour_accessory: function (keyset, to) {
        designer.set_val('extra_' + keyset, to);
        $.each($('.carousel-left .slider a'), function (key, value) {
            if ($(this).attr('formcategory') == keyset) {
                var img = $(this).find('img');
                img.attr('src', 'designer/accessory-img/' + $(this).attr('data-val') + '/' + to);
            }
        });
    },

    colour_match: function (to, key, value) {
        var options = designer.option_for_val(key, value);
        if (options == undefined)
            return 'error';

        var colours = designer.get_colour_object(to);
        var toColour = to;
        if (colours != undefined) {
            var isIndexed = false;
            for (var i in options['show-extras']) {
                if (options['show-extras'][i] == to) {
                    isIndexed = true;
                    break;
                }
            }
            if (!isIndexed) {
                isIndexed = false;
                for (var i in colours.closest) {
                    for (var cx in options['show-extras']) {
                        if (options['show-extras'][cx] == colours.closest[i]) {
                            toColour = colours.closest[i];
                            isIndexed = true;
                            break;
                        }
                    }
                    if (isIndexed)
                        break;
                }
            }
        }
        return toColour;
    },

    recolour_accessories: function (to) {
        $.each($('.carousel-left .slider a'), function (key, value) {
            if (designer.current_tab.no_recolour == undefined) {
                var img = $(this).find('img');
                var toColour = designer.colour_match(to, $(this).attr('formcategory'), $(this).attr('data-val'));
                $(this).data('callback-action', 'designer.set_val("extra_' + $(this).attr('formcategory') + '", ' + toColour + ')');
                img.attr('src', 'designer/accessory-img/' + $(this).attr('data-val') + '/' + toColour);
            }
        });
    },

    geo_test: function () {
        $('.carousel-left').hide();
        $('.carousel-left a').first().trigger('click', null);
        $('.carousel-right').addClass('w-100');
        $('.designer-tabs').hide();
        $('.carousel-right').css('margin-left', '0');
        $('.carousel-right').css('padding-left', '0');
    },
    geo_undo: function () {
        $('.carousel-left').show();
        $('.carousel-right').removeClass('w-100');
        $('.designer-tabs').show();
        $('.carousel-right').css('margin-left', '2%');
        $('.carousel-right').css('padding-left', '2%');
    },


    get_colour_object: function (colour_id) {
        for (var i in colour_config) {
            if (colour_config[i].colour_id == colour_id)
                return colour_config[i];
        }
    },

    match_available_colour: function (key, colours) {
        var search = designer.current_json[key].extra_dropdown;
        for (var i in colours) {
            for (var index in search.options) {
                if (search.options[index].value == colours[i])
                    return search.options[index].value;
            }
        }
        return -1;
    },

    build_nav: function () {

        var selector = $('.nav-menu');
        selector.html('');

        if (designer.current_stage != engine_config.stage_2) {
            if (!designer.tablet()) {
                $('.details').css('padding-left', '5%');
            } else {

            }
            return;
        } else {
            if (!designer.tablet()) {
                $('.details').css('padding-left', '18%');
            }
        }
        if (designer.current_json == null)
            return;

        var html = '<li>Main Menu</li>';

        for (var i in menu_config) {
            var tmp = '';
            var tmp_data = '';

            var isActive = false;

            for (var nodename in menu_config[i].nodes) {
                nodename = menu_config[i].nodes[nodename];
                var append = false;
                var menu_node = engine_config.stage_2.menus[nodename];
                if (menu_node == designer.current_step) {
                    isActive = true;
                }
            }

            if (isActive) {
                tmp += '<li class="menu-head active"><a href="javascript:void(0)"> ';
            } else {
                tmp += '<li class="menu-head inactive"><a href="javascript:void(0)"> ';

            }
            tmp += menu_config[i].title;
            if (isActive)
                tmp += '<i class="fa fa-chevron-down chevron" aria-hidden="true"></i>';
            else
                tmp += '<i class="fa fa-chevron-right chevron" aria-hidden="true"></i>';

            tmp += '</li>';
            if (isActive) {
                tmp += '<li class="sub-menu"><a href="javascript:void(0)"><a href="javascript:void(0)" >';
            } else {
                tmp += '<li class="sub-menu inactive">';
            }
            tmp += '<ul>';
            var nodeNames;
            for (var nodename in menu_config[i].nodes) {
                nodeNames = nodename;
                nodename = menu_config[i].nodes[nodename];

                var append = false;
                var menu_node = engine_config.stage_2.menus[nodename];
                for (var tab in menu_node.tabs) {
                    if (menu_node.filter != undefined) {
                        if (!menu_node.filter())
                            continue;
                    }

                    if (menu_node.tabs[tab].load_type == 'multi-option-carousel') {
                        var breakLoop = true;
                        for (var xcheck in menu_node.tabs[tab].load_base) {

                            menu_node.disabled = true;

                            if (eval(designer.current_json[xcheck].filter)) {
                                menu_node.disabled = false;
                                break;
                            }
                        }
                        if (menu_node.disabled) {
                            append = false;
                            continue;
                        }
                    }
                    if (menu_node.tabs[tab].load_type != 'html' && menu_node.tabs[tab].load_type != 'multi-option-carousel') {
                        if (designer.current_json[menu_node.tabs[tab].load_base] == undefined) {
                            //  menu_node.disabled = true;
                            menu_node.disabled = true;
                            menu_node.disabled_goback = true;
                            continue;
                        } else {
                            menu_node.disabled = false;
                        }

                        if (!eval(designer.current_json[menu_node.tabs[tab].load_base].filter))
                            continue;
                    }
                    append = true;
                }

                if (append) {
                    if (designer.current_step == menu_node)
                        tmp_data += '<a href="javascript:void(0)"><li data-menu="' + nodename + '" class="menu-element activex">' + (menu_node.label) + '</li></a>';
                    else
                        tmp_data += '<a href="javascript:void(0)"><li class="menu-element" data-menu="' + nodename + '">' + (menu_node.label) + '</li></a>';
                }
            }
            if (tmp_data.length > 0) {
                tmp += tmp_data;
                tmp += '</ul>';
                tmp += '</li></a>';
                html += tmp;
            }
        }
        selector.html(html);

    },

    rebuild_menu: function (from) {
        var html = '';
        designer.build_nav();
        var showCount = 0;
        $.each($('.designer-tabs a'), function (key, val) {
            var check = $(this).attr('data-tab');

            if (designer.current_json == null) {
                return;
            }

            var cx = (designer.current_step.tabs[check]);

            if (cx == undefined || cx.load_base == undefined) {
                return;
            }

            if (cx.load_base.constructor != String) {

            } else {

                if (cx.load_base == undefined) {
                    alert("load base is undefined..");
                    return;
                }
                if (designer.current_json[cx.load_base] == undefined) {
                    $(this).hide();
                    return;
                }

                if (!eval(designer.current_json[cx.load_base].filter)) {
                    $(this).hide();
                } else {
                    showCount++;
                    $(this).show();
                }
            }
        });

        if (showCount > 0) {
            $('.designer-tabs').show();
            if (designer.mobile()) {
                $('.carousel-area.carousel-left').css('margin-top', '');
            }
        } else {
            $('.designer-tabs').hide();
            if (designer.mobile()) {
                $('.carousel-area.carousel-left').css('margin-top', '0');
            }
        }

        if (designer.current_tab == null || designer.current_tab.load_type != 'carousel') {
            $('.carousel-right').hide();
            $('.carousel-left').addClass('w-100');
        } else {

            var search_for = designer.current_json[designer.current_tab.load_base];
            if (search_for == undefined) {
                alert(designer.current_tab.load_base);
            }

            if (designer.current_option != undefined) {
                var count = 0;
                if (search_for.extra_dropdown != null) {
                    for (var i in search_for.extra_dropdown.options) {
                        var option = search_for.extra_dropdown.options[i];
                        if ($.inArray(parseInt(option.value), designer.current_option["show-extras"]) !== -1) {
                            count++;
                        }
                    }
                }

                if (count > 1
                    && designer.current_option["requires-extra-option"] == true
                    && designer.current_tab.hide_extra_menu == undefined) {

                    if (!designer.mobile()) {
                        $('.carousel-right').show();

                        $('.carousel-left').removeClass('w-100');

                        var search_for = designer.current_json[designer.current_tab.load_base];

                        if (search_for.extra_dropdown == undefined) {
                            $('.carousel-right').hide();
                            $('.carousel-left').addClass('w-100');
                            return;
                        }
                    } else {
                        $('.carousel-right').show();
                        $('.carousel-right').addClass('normalize');

                        $('.carousel-left').addClass('normalize');
                        var search_for = designer.current_json[designer.current_tab.load_base];

                        if (search_for.extra_dropdown == undefined) {
                            $('.carousel-right').hide();
                            $('.carousel-left').removeClass('normalize');
                            $('.carousel-left').addClass('w-100');
                            return;
                        }
                    }
                    var carousel = new Carousel('extra_' + designer.current_tab.load_base, {
                        no_animate: true
                    });

                    for (var i in search_for.extra_dropdown.options) {
                        var option = search_for.extra_dropdown.options[i];
                        if ($.inArray(parseInt(option.value), designer.current_option["show-extras"]) !== -1) {
                            carousel.add(option.label, option.value, option.thumbnail);
                        }
                    }

                    carousel.build($('.secondary-target'), function (v1, v2, v3) {
                        if (designer.current_tab.on_extra_change != undefined)
                            designer.current_tab.on_extra_change(v1, v2, v3);
                    });

                    $('.tabshow').html('<a href="javascript:void(0)">' + search_for.extra_dropdown.label + '</a>');
                    $('.tabshow').show();

                } else {
                    $('.carousel-right').hide();
                    $('.carousel-left').removeClass('normalize');
                    $('.carousel-left').addClass('w-100');
                }
            }
        }

        $('.designer-steps').html(html);

        $('.menu-element').click(function (e) {
            e.preventDefault();
            designer.load_menu(designer.current_stage.menus[$(this).attr('data-menu')]);
        });

        $('.menu-head').click(function (e) {
            $(this).next('.sub-menu').find('li').trigger('click', e);
        });
        designer.rebuild_summary();
        designer.ensure_consistency('letterplate_position_id');
        designer.ensure_consistency('internal_handle_id');
        designer.ensure_consistency('frame_internal_colour_id');
    },

    set_tooltip: function (type) {
        $('.narrat').html(type);
    },

    step_2: function () {
        $('.tooltip').hide();
        designer.loadJSON('https://cloud.solidor.co.uk/sg/json/' + designer.val('entrance_type_id') + '/' + designer.val('frame_id'),
            function (result) {
                designer.current_json = result;
                designer.current_json['blank'] = {};
                designer.current_stage = engine_config.stage_2;
                designer.stage_index = indexOf(designer.current_stage, engine_config);
                var first_menu = first(first(designer.current_stage));
                designer.load_menu(first_menu);
                $('#quote').show();
                designer.set_val('extra_hinge_id', designer.colour_match(designer.val('extra_external_handle_id'), 'hinge_id', designer.val('hinge_id')));
            });
    }
}


colour_config = {
    black: {
        colour_id: 33,
        closest: [34, 35],
    },
    peweter: {
        colour_id: 37,
        closest: [34, 35, 33],
    },
    chrome: {
        colour_id: 34,
        closest: [35, 37, 36],
    },
    white: {
        colour_id: 32,
        colour_id: 35,
        closest: [34, 37, 36]
    },
    brushed_ali: {
        colour_id: 35,
        closest: [34, 37, 36]
    }
}


menu_config = {
    door_style_frame: {
        title: 'Door Style & frame',
        nodes: ['door_style', 'left_sidepanel', 'right_sidepanel']
    },
    colours: {
        title: 'Colours',
        nodes: ['door_colour', 'frame_colours']
    },
    glass: {
        onload: function () {
        }

        , title: 'Glass',
        nodes: ['glass', 'panel_glass', 'topbox_glass']
    },
    hardware: {
        title: 'Hardware',
        nodes: ['hardware', 'handles', 'accessories', 'lock_system', 'hinge_type']
    }
},
    engine_config = {
        stage_1: {
            menus: {
                start_designing: {
                    hide_image: true,
                    label: 'Door type',
                    background_image: '/images/bg2.jpg',
                    title: 'Design your<br>dream door',
                    mob_title: 'Choose entrance',
                    sub_heading: 'Choose a range type below to request a quotation from an approved installer.',
                    tabs: {
                        door_selection: {
                            load_type: 'html',
                            load_url: 'entrances',
                            label: 'Entrance type',
                            ignore_rules: true,
                        }
                    },
                },

                frame_select: {
                    label: 'Frame type',
                    background_image: 'variable',
                    banner_target: '.doorstyle-banner',
                    pad: true,
                    onload: function () {
                        $('.tooltip').hide();
                        designer.show_nav();
                    },

                    background_img_handler: function () {
                        switch (designer.val('entrance_type_id')) {
                            case "1": // traditional
                                if (designer.val('door_collection_id') == "2")
                                    return 'images/backgrounds/contemporarydoors-bg.jpg';
                                return 'images/backgrounds/traditionaldoors-bg.jpg';
                                break;

                            case "2":
                                return 'images/backgrounds/stabledoors-bg.jpg';
                                break;

                            case "3": //
                                return 'images/backgrounds/frenchdoors-bg.jpg';
                                break;
                        }
                        return "wtf";
                    },

                    title: 'Choose your  <br/>frame type',
                    mob_title: 'Choose frame type',
                    sub_heading: 'Start by selecting your frame design from the options below.',
                    pad: true,
                    tabs: {

                        door_selection: {
                            load_type: 'carousel',
                            label: 'Frame type',
                            pad: true,
                            hide_text: true,
                            load_base: 'frame_id',

                        }
                    },
                },
            },

            on_load: function () {
            },
            on_complete: function () {
                $('#sum-btn').show();
                $('#view-side').show();
                $('#launch-visualiser').show();
                designer.step_2();
            }
        },

        stage_2: {
            menus: {
                door_style: {
                    label: 'Door style',
                    background_image: 'variable',
                    banner_target: '.banner1',
                    background_img_handler: function () {
                        switch (designer.val('entrance_type_id')) {
                            case "1": // traditional
                                if (designer.val('door_collection_id') == "2")
                                    return 'images/backgrounds/contemporarydoors-bg.jpg';
                                return 'images/backgrounds/traditionaldoors-bg.jpg';
                                break;

                            case "2":
                                return 'images/backgrounds/stabledoors-bg.jpg';
                                break;

                            case "3": //
                                return 'images/backgrounds/frenchdoors-bg.jpg';
                                break;
                        }
                        return "wtf";
                    },
                    title: 'Choose your <br/>door style',
                    mob_title: 'Choose door style',
                    sub_heading: 'We have a vast selection of different doors for you to choose from, ranging from solid to fully glazed. <br>Have a look at the designs below and choose your dream door.',
                    tabs: {
                        door_selection: {
                            load_type: 'carousel',
                            load_base: 'slab_id',
                            label: 'Door style',
                        }
                    },
                },
                left_sidepanel: {
                    label: "Left sidepanel",
                    background_image: '/images/step-colour-bg.jpg',
                    title: 'Choose left side panel style',
                    mob_title: 'Choose left sidepanel',
                    sub_heading: 'Select your left side panel style',
                    tabs: {
                        sidepanel_type: {
                            load_type: 'carousel',
                            load_base: 'left_panel_style_id',
                            label: 'Sidepanel style',
                        },
                        composite_type: {
                            load_type: 'carousel',
                            load_base: 'left_composite_style_id',
                            label: 'Composite style',
                        },
                    },
                },

                right_sidepanel: {
                    label: "Right sidepanel",
                    background_image: '/images/step-colour-bg.jpg',
                    title: 'Choose right side panel style',
                    mob_title: 'Choose right sidepanel',
                    sub_heading: 'Select your right side panel style',
                    tabs: {
                        sidepanel_type: {
                            load_type: 'carousel',
                            load_base: 'right_panel_style_id',
                            label: 'Sidepanel style',
                        },
                        composite_type: {
                            load_type: 'carousel',

                            load_base: 'right_composite_style_id',
                            label: 'Composite style',
                        },
                    },
                },
                door_colour: {
                    label: 'Door colours',
                    background_image: '/images/backgrounds/colour-bg.jpg',
                    title: 'Make a<br> statement',
                    mob_title: 'Choose door colour',
                    sub_heading: 'Our doors come in over 11,000 possible colour combinations. <br>Create your perfect door colour by choosing the external and internal colour below.',
                    banner_target: '.colours-banner',

                    tabs: {
                        ext_colour: {
                            load_type: 'carousel',
                            load_base: 'door_external_colour_id',
                            label: 'External colour',
                            replace_path: true,
                            fill_image: true,

                            onchange: function (from, to) {
                                designer.set_val('left_composite_external_colour_id', to);
                                designer.set_val('right_composite_external_colour_id', to);
                            },

                            onselect: function () {
                                $('.details p').html('Our doors come in over 11,000 possible colour combinations. <br>Create your perfect door colour by choosing the external and internal colour below.');
                            }

                        },

                        int_colour: {
                            load_type: 'carousel',
                            load_base: 'door_internal_colour_id',
                            label: 'Internal colour',
                            replace_path: true,
                            flip_view: 'internal',
                            fill_image: true,

                            onselect: function () {
                                $('.details p').html('Our doors come in over 11,000 possible colour combinations. <br>Create your perfect door colour by choosing the external and internal colour below.');
                            },

                            onchange: function (from, to) {
                                designer.set_val('left_composite_internal_colour_id', to);
                                designer.set_val('right_composite_internal_colour_id', to);
                            }

                        },
                    },
                },

                frame_colours: {
                    label: "Frame colours",
                    banner_target: '.framecolours-banner',

                    background_image: '/images/backgrounds/colour-bg.jpg',
                    title: 'Frame your <br>dream door',
                    mob_title: 'Choose frame colour',
                    sub_heading: 'Complete the aesthetics of your door by choosing a frame colour below.',
                    tabs: {
                        ext_colour: {
                            label: 'External colour',
                            load_type: 'carousel',
                            replace_path: true,
                            fill_image: true,

                            load_base: 'frame_external_colour_id',
                        },

                        int_colour: {
                            label: 'Internal colour',
                            replace_path: true,
                            fill_image: true,
                            flip_view: 'internal',
                            load_type: 'carousel',
                            load_base: 'frame_internal_colour_id',
                        }
                    }
                },


                glass: {
                    label: 'Glass',
                    background_image: '/images/backgrounds/glass-bg.jpg',
                    title: 'Stunning glass',
                    mob_title: 'Choose glass',
                    banner_target: '.glass-banner',
                    onload: function () {
                        var xval = designer.val('slab_id');
                        if (xval == 50 || xval == 52) {
                            designer.set_val('external_glass_id', 97);
                            $('.carousel-left a').first().trigger('click');
                        }
                    },
                    sub_heading: 'Highlight your Solidor by choosing the perfect glazing accompaniment.<br><span class="notify">Please note: <br>Some options come with built in obscure backing glass and do not need to have an additional backing glass chosen.</span>',
                    tabs: {
                        ext_glass: {
                            label: 'External glass',
                            load_type: 'carousel',
                            load_base: 'door_glass_id'
                        },
                    }
                },
                topbox_glass: {
                    label: 'Topbox Glass',
                    hide_extra_menu: true,
                    title: 'Topbox Glass',
                    mob_title: 'Choose topbox glass',
                    banner_target: '.glass-banner',
                    sub_headining: 'Select glass for your topbox from the options below.',
                    tabs: {
                        topbox_glass: {
                            load_type: 'carousel',
                            label: ' Topbox glass',
                            load_base: 'top_box_glass_id',
                        }
                    }
                },
                panel_glass: {
                    label: 'Sidepanels',
                    hide_extra_menu: true,

                    background_image: '/images/backgrounds/glass-bg.jpg',
                    title: 'Sidepanel Glass',
                    mob_title: 'Choose sidepanel glass',
                    banner_target: '.glass-banner',

                    sub_heading: 'Highlight your Solidor by choosing the perfect glazing accompaniment.<br><span class="notify">Please note: <br>Some options come with built in obscure backing glass and do not need to have an additional backing glass chosen.</span>',
                    tabs: {
                        left_glass: {
                            label: 'Left Glass',
                            load_type: 'carousel',
                            load_base: 'left_panel_glass_id',
                            hide_extra_menu: true,

                        },
                        right_glass: {
                            label: 'Right Glass',
                            load_type: 'carousel',
                            load_base: 'right_panel_glass_id',
                            hide_extra_menu: true,
                        },
                    }
                },
                hardware: {
                    label: 'Hardware suite',
                    title: 'Hardware suite',
                    mob_title: 'Choose hardware',
                    banner_target: '.banner2',
                    background_image: '/images/step-hardware-bg.jpg',
                    sub_heading: 'From premium quality door handles and door pulls to door knockers, our exclusive door furniture range will compliment your door perfectly.<br>Start by choosing your hardware suite below.',
                    tabs: {
                        main: {
                            label: 'Hardware suite',
                            load_type: 'html',
                            load_url: 'hardware',
                        }
                    }
                },

                handles: {
                    label: 'Handle options',
                    title: 'Handle options',
                    mob_title: 'Choose handle',
                    background_image: '/images/backgrounds/hardware-bg.jpg',
                    sub_heading: 'We offer a wide range of hardware suites to accompany each style of Solidor doors. Select a handle style below to view its full hardware range.<br>Once you are happy pick an external colour.',
                    onload: function () {
                        designer.recolour_handles(designer.val('extra_external_handle_id'));

                    },
                    tabs: {
                        main: {
                            load_type: 'carousel',
                            load_base: 'external_handle_id',
                            label: 'Handle type',

                            on_extra_change: function (from, to) {
                                $('input[name="extra_knocker_id"]').val(to);
                                $('input[name="extra_spyhole_id"]').val(to);
                                $('input[name="extra_letterplate_id"]').val(to);
                                $('input[name="extra_hinge_id"]').val(to);
                                designer.requires_image_update = true;
                                designer.recolour_handles(to);
                                designer.get_image();
                            },
                        },
                        main_internal: {
                            load_type: 'carousel',
                            load_base: 'internal_handle_id',
                            label: 'Internal Handle',
                            hide_extra_menu: true,
                            flip_view: 'internal',

                            on_extra_change: function (from, to) {

                            },
                        },

                    }
                },

                accessories: {
                    label: 'Accessories',
                    title: 'Accessories',
                    mob_title: 'Choose Accessories',
                    banner_target: '.banner-furniture',
                    onload: function () {

                        designer.recolour_accessories(designer.val('extra_external_handle_id'));

                    },
                    background_image: '/images/backgrounds/accessories-bg.jpg',
                    sub_heading: 'A selection of beautiful accessories and door furniture to perfectly complement your choice of door. <br><span class="notify">Please note: we will auto match all of your furniture and hardware choices so they match.</span>',
                    tabs: {
                        main: {
                            label: 'Accessories',
                            load_type: 'multi-option-carousel',

                            load_base: {
                                letterplate_id: {
                                    deselected_id: 59
                                },
                                knocker_id: {
                                    deselected_id: 56
                                },
                                spyhole_id: {
                                    deselected_id: 57
                                }
                            },
                            label: 'Accessories',
                            ignore_items: [59, 56, 57],
                            hide_extra_menu: true,
                        },
                        letterplate_position: {
                            strict_enforcement: true,
                            no_recolour: true,
                            label: 'Letterplate position',
                            load_type: 'carousel',
                            load_base: 'letterplate_position_id',
                        }
                    },
                    on_load: function () {
                    },
                },
                lock_system: {
                    label: 'Door Lock Cylinder',
                    background_image: '/images/backgrounds/accessories-bg.jpg',
                    title: 'High security <br>as standard',
                    mob_title: 'Choose lock',
                    sub_heading: 'You can benefit from keyless locking internally with our Thumb Turn option or a traditional key operation. ',

                    banner_target: '.banner3',

                    tabs: {
                        main: {
                            label: 'Door Lock Cylinder',
                            load_type: 'html',
                            load_url: 'locks',
                            hide_extra_menu: true,
                        }
                    }
                },
                hinge_type: {
                    label: 'Hinge side',
                    background_image: '/images/backgrounds/accessories-bg.jpg',
                    title: 'Hinge side',
                    mob_title: 'Choose hinge side',
                    filter: function () {
                        return designer.val('entrance_type_id') != 3;
                    },

                    sub_heading: 'The hinge side will determine the way your door will open. Please choose yours below.',
                    banner_target: '.banner3',

                    tabs: {
                        main: {
                            label: 'Door Lock Cylinder',
                            load_type: 'html',
                            load_url: 'hinges',
                            hide_extra_menu: true,
                        }
                    }
                },
            },

            on_complete: function () {
                $('.quote-sum-box').slideUp(100);

                $('.summary-max').animate({
                    'left': 0
                }).animate({
                    'opacity': 1
                }, function () {
                    var target = $('.summary-internal-wrapper');
                    target.animate({
                        scrollTop: target.height()
                    });
                    target = null;
                });
                $('.quote-sum-box').slideDown(100);


            },

        }
    }


summary_options = {
    frame_style: {
        label: "Frame style",
        data: {
            entrance_type: {
                name: "Entrance Type",
                name2: 'Entrance Type',
                key: "entrance_type_id"
            },
            frame_style: {
                name: "Frame Style",
                name2: 'Frame Style',
                key: "frame_id"
            },
            internal_colour: {
                name: "Internal Colour",
                name2: 'Frame Int. Colour',
                key: "frame_internal_colour_id"
            },
            external_colour: {
                name: "External Colour",
                name2: 'Frame Ext. Colour',
                key: "frame_external_colour_id"
            },
        }
    },
    door_style: {
        label: "Door options",
        data: {
            door_type: {
                name: "Door Style",
                name2: 'Door Style',
                key: "slab_id"
            },
            ext_color: {
                name: "External Colour",
                name2: 'Door Ext. Colour',
                key: "door_external_colour_id"
            },
            int_color: {
                name: "Internal Colour",
                name2: 'Door Int. Colour',
                key: "door_internal_colour_id"
            },
            glass: {
                name: "Glass",
                key: "door_glass_id",
                name2: 'Door Ext. Glass',
            },

        },
    },

    hardware_stuff: {
        label: "Hardware options",
        data: {
            handle_colour: {
                name: "Hardware Colour",
                name2: 'Hardware Colour',
                key: 'extra_external_handle_id',
            },
            handle: {
                name: "Handle",
                name2: 'Ext. Handle',
                key: "external_handle_id"
            },

            letterplate: {
                name: "Letterplate",
                name2: 'Letterplate',
                key: "letterplate_id"
            },
            spyhole: {
                name: "Spyhole",
                name2: "Spyhole",
                key: "spyhole_id"
            },
            knocker: {
                name: "Knocker",
                name2: 'Knocker',
                key: "knocker_id"
            },

        }
    },
    sidepanel_options: {
        label: 'Sidepanels',
        data: {
            left_style: {
                name: 'Left style',
                name2: 'Left Side Style',
                key: "left_panel_style_id"
            },
            left_glass: {
                name: 'Left glass',
                name2: 'Left Glass',
                key: 'left_panel_glass_id'
            },
            right_style: {
                name: 'Right style',
                name2: 'Right Side Style',
                key: "right_panel_style_id"
            },
            right_glass: {
                name: 'Right glass',
                name2: 'Right Glass',
                key: 'right_panel_glass_id'
            },
        }
    }
}
