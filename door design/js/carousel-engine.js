function Carousel(formName, options) {
    this.form_name = formName;
    this.items = [];
    this.options = options;
    this.size = 0;

    this.add = function (name, val, img_url, options) {
        this.items.push({name: name, img_url: img_url, val: val, extras: options});
        this.size++;
    },


        this.build_dropdown = function (target, callback, selected) {
            target.html('');
            $.each(this.items, function (key, val) {
                target.append('<option value="' + target.value + '">' + target.label + '/>');
            });
        },


        this.build_component = function (val, optionz, extras) {
            var imgStringBuilder = "";

            imgStringBuilder += '<img src="' + val.img_url + '"';

            if (extras != null) {
                if (extras.fill == true) {
                    imgStringBuilder += 'class="fillimage"';
                }
            }
            imgStringBuilder += '/>';

            var nameStringBuilder = "";
            if (optionz == undefined || optionz.descriptive == undefined)
                nameStringBuilder += '<span class="name">' + val.name + '</span>';
            else
                nameStringBuilder += '<span class="span1">' + val.name + '</span><span class="span2">Lorem ipsum dolor sit amet, consecteur adpischign elit acaenas tellus velit pretium vita</span>';
            return imgStringBuilder + nameStringBuilder;

        },

        this.build = function (target, callback, selected) {
            // Clear current html
            target.html('');
            var htmlList = "";

            var optionz = this.options;
            if (this.options != undefined && this.options.descriptive != undefined)
                htmlList += '<div class="handleoptions"><div class="handletype">';

            // put selected at beggining of list.

            var moveInd = -1;
            for(var i in this.items){
                if(this.items[i].val == $('input[name="'+this.form_name+'"]').val()){
                    moveInd = i;
                    break;
                }
            }
            if(moveInd != -1) {
                var element = this.items[moveInd];
                 this.items.splice(moveInd, 1);
                this.items.splice(0, 0, element);
            }

            var xval = this.selected_value;
            var carousel = this;
            $.each(this.items, function (key, val) {
                if (val.val != xval)
                    htmlList += '<a data-val="' + val.val + '"';
                else {
                    htmlList += '<a class="active" style="data-val="' + val.val + '"';
                }
                if (val.extras != null) {
                    for (var i in val.extras) {
                        if (val.extras[i] != null)
                            htmlList += i + '="' + val.extras[i] + '" ';
                    }
                }

                htmlList += '>';
                htmlList += carousel.build_component(val, optionz, val.extras);
                htmlList += '<span class="overlay">';

                htmlList += '</span></a>';


            });

            if (this.options != undefined && this.options.descriptive != undefined) {
                htmlList += '</div></div>';
            }
            target.html(htmlList);
            if(this.options != undefined && this.options.pad != undefined){
                target.find('a').css('padding-bottom', '4px');
            }


            var form = this.form_name;

            target.find('a').click(function (e) {
                if (e != null)
                    e.preventDefault();
                if ($(this).attr('deselected_id') != undefined) {
                    var search = $(this).attr('formcategory') != undefined ? $(this).attr('formcategory') : form;
                    if ($(this).attr('data-val') == $('input[name="' + search + '"]').val()) {

                        $(this).removeClass('active');
                        designer.requires_image_update = true;
                        designer.set_val(search, $(this).attr('deselected_id'));
                        if (callback != undefined)
                            callback(form, $(this).attr('data-val'), $(this));

                        return;
                    }
                }
                if ($(this).attr('formcategory') != undefined) {
                    var attr = $(this).attr('formcategory');
                    $.each(target.find('a'), function (searchKey, searchVal) {
                        if ($(this).attr('formcategory') == attr) {
                            $(this).removeClass('active');
                        }
                    });

                    $(this).addClass('active');
                    designer.set_val($(this).attr('formcategory'), $(this).attr('data-val'));

                } else {
                    target.find('a').removeClass('active');
                    $(this).addClass('active');

                    designer.set_val(form, $(this).attr('data-val'));//(search).val($(this).attr('data-val'));
                }
                var val = $(this).attr('data-val');

                if (callback != null) {
                    callback(form, val, $(this));
                }
            });

            var leng = 0;

            var items = target.find('.carousel-item');
            $.each(items, function (key, val) {
                leng += $(val).width();
            });

            var formName = this.form_name;
            $.each(target.find('a'), function (key, value) {
                var search = $(this).attr('formcategory') != undefined ? $(this).attr('formcategory') : form;
                target.data('formcat', formName);
                if ($(this).attr('data-val') == $('input[name="' + search + '"]').val()) {
                    $(this).addClass('active');
                }
            });
            $.each(target.find('a'), function (key, val) {
                if ($(this).hasClass('active')) {
                    if (callback != undefined) {
                        callback(form, $(this).attr('data-val'), $(this));
                    }
                }
            });

            if (this.options != undefined && this.options.no_animate != undefined)
                return;

            target.scrollLeft(150000);
            target.css('opacity', 0.2);
            //target.animate({
            //    scrollLeft: 150000,
            //}, 0);
            //
            target.scrollLeft(150000);

            target.animate({
                scrollLeft: 0,opacity: 1
            }, 900);


        };
}