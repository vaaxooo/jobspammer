$(document).ready(function () {

    /**
     * CREATE TASK
     */
    $("#btn-create-task").on('click', function () {
        event.preventDefault();
        $.hideMessage();
        let data = getFormData($("#create-task"));
        const httpData = new FormData();
        for (let prop in data) {
            httpData.append(prop, data[prop]);
        }
        httpData.append("file", $("#file")[0].files[0]);
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                const status = this.status;
                const data = JSON.parse(this.responseText);
                $.showMessage(data.message, data.status);
                if (data.status === true) {
                    location.href = "/"
                }
            }
        };
        xhttp.open('POST', $("#create-task").attr('action'));
        xhttp.send(httpData);
    });


    /**
     * EDIT SETTINGS
     */
    $("#btn-edit-settings").on('click', function () {
        event.preventDefault();
        let data = getFormData($("#edit-settings"));
        XMLRequest(data, "/settings/alias", "/settings/alias/" + $("#settings_id").val());
    });

    /**
     * ADD PROXY
     */
    $("#btn-add-proxy").on('click', function () {
        event.preventDefault();
        let data = getFormData($("#add-proxy"));
        XMLRequest(data, "/proxy/add", "/proxy/index");
    });

    /**
     * EDIT PROXY
     */
    $("#btn-edit-proxy").on('click', function () {
        event.preventDefault();
        let data = getFormData($("#edit-proxy"));
        XMLRequest(data, "/proxy/edit", "/proxy/edit/" + $("#proxy_id").val());
    });

    /**
     * LOGIN ACCOUNT
     */
    $("#btn-account-login").on('click', function () {
        event.preventDefault();
        let data = getFormData($("#account-login"));
        XMLRequest(data, "/account/login", "/");
    });

    /**
     * CHANGE PASSWORD ACCOUNT
     */
    $("#btn-account-changepassword").on('click', function () {
        event.preventDefault();
        let data = getFormData($("#account-changepassword"));
        XMLRequest(data, "/account/changepassword", "/account/logout");
    });

    /**
     * CHANGE PASSWORD ACCOUNT
     */
    $("#btn-account-edit").on('click', function () {
        event.preventDefault();
        let data = getFormData($("#account-edit"));
        XMLRequest(data, "/account/edit", "/account/edit");
    });


    $("#sort-tasks").on('change', function () {
        event.preventDefault();
        changeParams("sort", $("#sort-tasks").val());
    });

    $("#sort-tasks-type").on('change', function () {
        event.preventDefault();
        changeParams("sort_type", $("#sort-tasks-type").val());
    });

    /**
     * EDIT PORTAL
     */
    $("#btn-edit-portal").on('click', function () {
        event.preventDefault();
        let data = getFormData($("#edit-portal"));
        XMLRequest(data, "/portal/edit", "/portal/edit/" + $("#portal_id").val());
    });

    /**
     * ADD SETTINGS
     */
    $("#btn-add-alias").on('click', function () {
        event.preventDefault();
        let data = getFormData($("#add-settings"));
        XMLRequest(data, "/settings/add", "/settings/index");
    });

    /**
     * ADD PORTAL
     */
    $("#btn-add-portal").on('click', function () {
        event.preventDefault();
        let data = getFormData($("#add-portal"));
        XMLRequest(data, "/portal/add", "/portal/index");
    });

    /**
     * RESTART TASK BUTTON
     */
    $.restartTask = function restartTask(task_id) {
        $.hideMessage();
        event.preventDefault();
        const httpData = new FormData();
        httpData.append("task_id", task_id);
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                const status = this.status;
                const data = JSON.parse(this.responseText);
                $.showMessage(data.message, data.status);
                if (data.status === true) {
                    location.href = "/"
                }
            }
        };
        xhttp.open("POST", "/tasks/restart");
        xhttp.send(httpData);
    }


    /**
     *
     * @param $form
     * @returns {{}}
     */
    function getFormData($form) {
        var unindexed_array = $form.serializeArray();
        var indexed_array = {};
        $.map(unindexed_array, function (n, i) {
            indexed_array[n['name']] = n['value'];
        });
        return indexed_array;
    }

    function XMLRequest(data, url, redirect = null, method = "POST",) {
        const httpData = new FormData();
        $.hideMessage();

        for (let prop in data) {
            httpData.append(prop, data[prop]);
        }
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                const status = this.status;
                const data = JSON.parse(this.responseText);
                $.showMessage(data.message, data.status);
                if (data.status === true && redirect !== null) {
                    location.href = redirect
                }
            }
        };
        xhttp.open(method, url);
        xhttp.send(httpData);
    }

    $.changePortalStatus = function changePortalStatus(portal_id, status) {
        const httpData = new FormData();
        httpData.append('portal_id', portal_id);
        httpData.append('status', status);

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                const status = this.status;
                const data = JSON.parse(this.responseText);
                location.reload();
            }
        };
        xhr.open('POST', '/portal/index');
        xhr.send(httpData);
    }

    $.changeSettingStatus = function changeSettingStatus(settings_id, status) {
        const httpData = new FormData();
        httpData.append('settings_id', settings_id);
        httpData.append('status', status);

        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                const status = this.status;
                const data = JSON.parse(this.responseText);
                location.reload();
            }
        };
        xhr.open('POST', '/settings/index');
        xhr.send(httpData);
    }

    $.changeProxyActive = function changeProxyActive(proxy_id, status) {
        const httpData = new FormData();
        httpData.append('proxy_id', proxy_id);
        httpData.append('status', status);
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                const status = this.status;
                const data = JSON.parse(this.responseText);
                location.reload();
            }
        };
        xhr.open('POST', '/proxy/index');
        xhr.send(httpData);
    }

    $.showMessage = function showMessage(message, status) {
        let block = `<div id="toast-container" class="toast-top-right">
                        <div class="toast toast-${status ? "success" : "danger"}" aria-live="polite" style="">
                            <div class="toast-message">${message}</div>
                        </div>
                    </div>`;
        $("#notification").html(block);
        /*        setTimeout($("#notification").html(""), 10000);*/
    }

    $.hideMessage = function hideMessage() {
        $("#notification").html("");
    }


    $.createPagination = function createPagination(limit, total, current_total) {
        const paginationBlock = $("#pagination");
        paginationBlock.html();
        let pages = +Math.ceil(+total / +limit);
        if (limit < total) {
            paginationBlock.removeClass('hidden');
            let current_page = +$.getUrlParam("page");

            if (!current_total || pages <= 1) {
                paginationBlock.addClass('hidden');
                return false;
            }
            let element = `<ul class="pagination mt-3 justify-content-end">
                                <li class="page-item previous ${current_page === 1 ? 'disabled' : ''}">
                                    <a href="${location.pathname}?page=${+current_page - 1}" class="page-link"><i class="previous"></i></a>
                                </li>`;
            for (let i = +current_page > 1 ? +current_page - 1 : +current_page; i <= +current_page + 3; i++) {
                element += `<li class="page-item ${current_page === i ? 'active' : ''} ${i > pages ? 'disabled' : ''}">
                                <a href="${location.pathname}?page=${i}" class="page-link">${i}</a>
                            </li>`;
            }
            if(+pages > 6) {
                element += `<li class="page-item ${current_page === pages ? 'active' : ''} ${pages >= current_page ? 'disabled' : ''}">
                                <a href="${location.pathname}?page=${+pages}" class="page-link">${pages}</a>
                            </li>`
            }
            element += `<li class="page-item next ${current_page === pages ? 'disabled' : ''}">
                            <a href="${location.pathname}?page=${+current_page + 1}" class="page-link"><i class="next"></i></a>
                        </li>`
            paginationBlock.html(element);
        }

    }


    $.getUrlParam = function getUrlParam(name) {
        var s = window.location.search;
        s = s.match(new RegExp(name + '=([^&=]+)'));
        return s ? s[1] : 1;
    };

    function changeParams(prmName, value) {
        let res = '';
        let d = location.href.split("#")[0].split("?");
        let base = d[0];
        let query = d[1];
        if (query) {
            let params = query.split("&");
            for (let param of params) {
                let keyval = param.split("=");
                if (keyval[0] != prmName) {
                    res += param + '&';
                }
            }
        }
        res += prmName + '=' + value;
        history.pushState('', '', base + '?' + res);
        location.reload();
        return false;
    };




    $('#host_proxy').mask('0ZZ.0ZZ.0ZZ.0ZZ', { translation: { 'Z': { pattern: /[0-9]/, optional: true } } });

});