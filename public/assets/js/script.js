$(document).ready(function () {

    /**
     * CREATE TASK
     */
    $("#btn-create-task").on('click', function () {
        event.preventDefault();
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
        event.preventDefault();
        const httpData = new FormData();
        httpData.append("task_id", task_id);
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                const status = this.status;
                const data = JSON.parse(this.responseText);
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

        for (let prop in data) {
            httpData.append(prop, data[prop]);
        }
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                const status = this.status;
                const data = JSON.parse(this.responseText);
                if (data.status === true || redirect !== null) {
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

});