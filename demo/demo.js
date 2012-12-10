(function () {

    var API = window.APPDOTNET;

    var init = function () {
        API.init();

        check_access_token();

        add_api_methods();
        activate_buttons();
    }

    var check_access_token = function () {
        if (window.location.hash !== '' && !window.localStorage.access_token) {
            var keys = URI('?' + window.location.hash.slice(1)).query(true);
            if (keys && keys.access_token) {
                window.localStorage.access_token = keys.access_token;

                window.location.hash = ''; // for older browsers, leaves a # behind
                history.pushState('', document.title, window.location.pathname); // nice and clean
            }
        }

        console.log("Checking access token...");
        if (window.localStorage.access_token) {
            console.log("...user is authenticated");
            login();
        } else {
            console.log("...not authenticated");
            $('#logged-out').removeClass('hide');
            ask_for_authentication();
        }
    };

    var ask_for_authentication = function () {
        console.log('Initializing authentication...');

        $('#authenticate-button').on('click', function () {
            console.log('authenticating...');
            var url = API.get_auth_url(API_OPTIONS);
            window.location.href = url;
        });

        console.log('...initialized.');
    };

    var logout = function () {
        console.log('Logging out...');
        $('#logged-in').addClass('hide');
        $('#logged-out').removeClass('hide');

        delete window.localStorage.access_token;
        delete API.options.access_token;

        console.log('...logged out.');

        ask_for_authentication();
    }


    var login = function () {
        $('#logged-out').addClass('hide');
        $('#logged-in').removeClass('hide');

        API_OPTIONS.access_token = window.localStorage.access_token;
        API = API.init(API_OPTIONS);

        $('#logout-button').on('click', function () {
            logout();
        });


        var get_user_info = function () {
            ///$('#authenticate').addClass('hide');

            API.getUser().done(function (data) {
                $('#userinfo').find('.user_full_name').text(data.data.name);
                ///$('#userinfo').removeClass('hide');
            });
        }

        get_user_info();
    }

    var add_api_methods = function() {
        var methods = [
            {
                name: 'getUser',
                prettyName: 'Get User',
                args: [
                    {
                        name: 'user_id',
                        description: "User id number, @username, or 'me'"
                    },
                ],
            },
            {
                name: 'getUsers',
                prettyName: 'Get Users',
                args: [
                    {
                        name: 'user_id_list',
                        description: "Comma-separated: User id numbers, @usernames, and/or 'me'"
                    },
                ],
            },
            {
                name: 'getUserAvatar',
                prettyName: 'Get User Avatar',
                args: [
                    {
                        name: 'user_id',
                        description: "User id number, @username, or 'me'"
                    },
                ],
            },
            {
                name: 'getUserCover',
                prettyName: 'Get User Cover',
                args: [
                    {
                        name: 'user_id',
                        description: "User id number, @username, or 'me'"
                    },
                ],
            },
        ];


        for (var i = 0; i < methods.length; i++) {
            var htmlString = '\
                <div id="'+methods[i].name+'">\
                    <h3>'+methods[i].prettyName+'</h3>\
                    \
                    <div class="method-form">\
                        <a class="btn submit-button pull-right">'+methods[i].prettyName+'</a>\
                        ';
            for (var j = 0; j < methods[i].args.length; j++) {
                htmlString += '\
                        <div class="input-prepend">\
                            <span class="add-on">'+methods[i].args[j].name+'</span>\
                            <input id="'+methods[i].name+'-'+methods[i].args[j].name+'" class="span4" type="text" placeholder="'+methods[i].args[j].description+'">\
                        </div>';
            };
            htmlString += '\
                    </div>\
                    \
                    <div class="method-response hide">\
                        <a class="btn btn-mini btn-inverse pull-right" onclick="javascript:$(\'#'+methods[i].name+' .method-response\').addClass(\'hide\');">Hide</a>\
                        <div class="response-meta">\
                            <h4>Meta:</h4>\
                            <pre></pre>\
                        </div>\
                        <div class="response-data">\
                            <h4>Data:</h4>\
                            <pre></pre>\
                        </div>\
                    </div>\
                    \
                    <hr>\
                </div>';

            $('#api-methods').append(htmlString);
        };
        

    };





    var activate_buttons = function() {
        $('#getUser .submit-button').on('click', function() {

            var failCallback = function (data) {
                $('#getUser .method-response').removeClass('hide');
                $('#getUser .response-meta').removeClass('hide').find('pre').text(window.JSON.stringify(window.JSON.parse(data.responseText).meta, null, 4));
                $('#getUser .response-data').addClass('hide');
            }

            var user_id = $('#getUser-user_id').val();
            API.getUser(user_id).done( function (data) {
                $('#getUser .method-response').removeClass('hide');
                $('#getUser .response-meta').removeClass('hide').find('pre').text(window.JSON.stringify(data.meta, null, 4));
                $('#getUser .response-data').removeClass('hide').find('pre').text(window.JSON.stringify(data.data, null, 4));
            }).fail(failCallback);
        });

        $('#getUsers .submit-button').on('click', function() {

            var failCallback = function (data) {
                $('#getUsers .method-response').removeClass('hide');
                $('#getUsers .response-meta').removeClass('hide').find('pre').text(window.JSON.stringify(window.JSON.parse(data.responseText).meta, null, 4));
                $('#getUsers .response-data').addClass('hide');
            }

            var user_id_list = $('#getUsers-user_id_list').val();
            API.getUsers(user_id_list).done( function (data) {
                $('#getUsers .method-response').removeClass('hide');
                $('#getUsers .response-meta').removeClass('hide').find('pre').text(window.JSON.stringify(data.meta, null, 4));
                $('#getUsers .response-data').removeClass('hide').find('pre').text(window.JSON.stringify(data.data, null, 4));
            }).fail(failCallback);
        });

        $('#getUserAvatar .submit-button').on('click', function() {
            var user_id = $('#getUserAvatar-user_id').val();

            var doneCallback = function (data) {
                $('#getUserAvatar .method-response').removeClass('hide');
                $('#getUserAvatar .response-meta').addClass('hide');

                var img = document.createElement("img");
                img.src = API.absoluteURL(API.getUserAvatarURL(user_id));
                $('#getUserAvatar .response-data').removeClass('hide').find('pre').html(img);

            };

            var failCallback = function (data) {
                $('#getUserAvatar .method-response').removeClass('hide');
                $('#getUserAvatar .response-meta').removeClass('hide').find('pre').text(window.JSON.stringify(window.JSON.parse(data.responseText).meta, null, 4));
                $('#getUserAvatar .response-data').addClass('hide');
            };

            API.getUserAvatar(user_id).done(doneCallback).fail(failCallback);
        });

        $('#getUserCover .submit-button').on('click', function() {
            var user_id = $('#getUserCover-user_id').val();

            var doneCallback = function (data) {
                $('#getUserCover .method-response').removeClass('hide');
                $('#getUserCover .response-meta').addClass('hide');

                var img = document.createElement("img");
                img.src = API.options.root_url + API.getUserCoverURL(user_id);
                $('#getUserCover .response-data').removeClass('hide').find('pre').html(img);
            }

            var failCallback = function (data) {
                $('#getUserCover .method-response').removeClass('hide');
                $('#getUserCover .response-meta').removeClass('hide').find('pre').text(window.JSON.stringify(window.JSON.parse(data.responseText).meta, null, 4));
                $('#getUserCover .response-data').addClass('hide');
            }

            API.getUserCover(user_id).done(doneCallback).fail(failCallback);

        });

    }

    init();
}());
