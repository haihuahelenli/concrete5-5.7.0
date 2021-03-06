if (typeof RedactorPlugins === 'undefined') var RedactorPlugins = {};

RedactorPlugins.concrete5magic = function() {

    return {
        styles: [],

        createButton: function(dropdown) {
            if (!dropdown) {
                var dropdown = [];
            }
            var plugin = this.concrete5magic;
            var btn;

            this.button.remove('styles');
            if (this.button.get('formatting').length) {
                btn = this.button.addAfter('formatting','styles', this.lang.get('customStyles'), false, dropdown);
            } else {
                btn = this.button.add('styles', this.lang.get('customStyles'), false, dropdown)
            }
            this.button.setAwesome('styles', 'fa-magic');
            this.button.addDropdown(btn, dropdown);
        },

        init: function() {

            var plugin = this.concrete5magic;
            var that = this;

            $.ajax({
                'type': 'get',
                'dataType': 'json',
                'url': CCM_DISPATCHER_FILENAME + '/ccm/system/backend/editor_data',
                'data': {
                    'ccm_token': CCM_EDITOR_SECURITY_TOKEN,
                    'cID': CCM_CID
                },

                success: function(response) {
                    var dropdown = {};

                    plugin.snippetsByHandle = {};
                    $.each(response.snippets, function(i, snippet) {
                        plugin.snippetsByHandle[snippet.scsHandle] = {
                            'scsHandle': snippet.scsHandle,
                            'scsName': snippet.scsName
                        }
                        dropdown[snippet.scsHandle] = {
                            'title': snippet.scsName,
                            'func': function(option, $item, obj, e) {
                                var selectedSnippet = plugin.snippetsByHandle[option];
                                var html = String() +
                                    '<span class="ccm-content-editor-snippet" contenteditable="false" data-scsHandle="' + selectedSnippet.scsHandle + '">' +
                                    selectedSnippet.scsName +
                                    '</span>';

                                that.insert.htmlWithoutClean(html);
                            }
                        }
                    });

                    var button = that.button.get('styles');

                    that.styles = response.classes;
                    jQuery.each(response.classes, function(i, s)
                    {
                        dropdown['s' + i] = { title: s.title, className:s.menuClass, func: function() { plugin.setCustomFormat(s); }};
                    });

                    dropdown['remove'] = { title: ccmi18n_redactor.remove_style, func: function() { plugin.resetCustomFormat(); }};
                    plugin.createButton(dropdown);

                }
            });
            plugin.createButton();

        },

        setCustomFormat: function (s)
        {
            if (s.forceBlock != -1 && (s.forceBlock == 1 || (s.wrap && !(jQuery.inArray(s.wrap,['a','em','strong','small','s','cite','q','dfn','abbr','data','time','var','samp','kbd','i','b','u','mark','ruby','rt','rp','bdi','bdo','span','sub','sup','code']) > -1)))) {
                this.selection.wrap(s.wrap);
                //this.inlineFormat(s.wrap);
                if(s.style) this.block.setAttr('style',s.style);
                if(s.spanClass) this.block.setClass(s.spanClass);
            }
            else {
                if(s.wrap) this.inline.format(s.wrap);
                if(s.style) this.block.setAttr('style', s.style);
                if(s.spanClass) this.inline.toggleClass(s.spanClass);
            }
        },
        resetCustomFormat: function()
        {
            var that = this;
            jQuery.each(this.styles, function(i,s) {
                if(s.spanClass) {
                    that.inline.removeFormat();
                    that.block.removeClass(s.spanClass);
                }
            });
        }
    }

}