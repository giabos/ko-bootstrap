/* global ko */


(function (ko) {

    ko.applyBindings({
        tabIdx: ko.observable(0),
        total: ko.observable(50),
        pageSize: ko.observable(10),
        pageIndex: ko.observable(0),
        modalOpen: ko.observable(false),
        show: function () {
            this.modalOpen(true);
        }
    });

})(ko);



