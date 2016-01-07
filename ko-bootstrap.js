/* global ko */

/**
 *  twitter bootstrap Tabs custom binding.
 * 
 *      usage:
 *          <ul data-bind="tbsTabs: tabIndex">
 *              <li>Tab 1</li>
 *              <li>Tab 2</li>
 *          </ul>
 * 
 * 
 */
(function (ko) {
    //'use strict';
  
    Element.prototype.on = Element.prototype.addEventListener;
    NodeList.prototype.forEach = Array.prototype.forEach;

    ko.bindingHandlers.tbsTabs = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var val = valueAccessor();
            var $ = element.querySelector.bind(element),
                $$ = element.querySelectorAll.bind(element);

            element.classList.add('nav', 'nav-tabs');
            $('li').classList.add('active');

            var eventHandlers = []; // array of objects: target, eventName, handler
    
            $$('li').forEach(function (li, i) {
                var a = document.createElement('a');
                a.setAttribute('href', '#');
                a.textContent = li.textContent;
                li.replaceChild(a, li.firstChild);

                a.on('click', function (evt) {
                    eventHandlers.push({ target: evt.target, eventName: evt.type, handler: arguments.callee });
                    val(i);
                    $('li.active').classList.remove('active');
                    $$('li')[i].classList.add('active');
                });
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                this.eventHandlers.forEach(function (eh) { eh.target.removeEventListener(eh.eventName, eh.handler); });
                $$('li').forEach(function (li, i) {
                    li.replaceChild(li.firstChild.firstChild, li.firstChild);
                });
            });


        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var val = valueAccessor();
            var $ = element.querySelector.bind(element),
                $$ = element.querySelectorAll.bind(element);

            var idx = val() || 0;
            $('li.active').classList.remove('active');
            $$('li')[idx].classList.add('active');
        }

    };

})(ko);

/**
 *  Twitter bootstrap pagination component.
 *       component name: 'tbs-pager'
 *       component template id: 'tbs-pager'
 *       params: total: nbr of elements, pageSize: nr of elements to show on 1 page, pageIndex: currently selected page (0 based) (observable).
 *
 */
(function (ko) {
    'use strict';


    var VM = function (params) {
        var self = this;

        self.total = ko.isObservable(params.total) ? params.total : ko.observable(params.total);
        self.pageSize = ko.isObservable(params.pageSize) ? params.pageSize : ko.observable(params.pageSize);
        self.pageIndex = ko.isObservable(params.pageIndex) ? params.pageIndex : ko.observable(params.pageIndex);

        self.pageCount = function () {
            var pages = Math.floor(self.total() / self.pageSize());
            if (self.total() % self.pageSize() > 0) {
                pages += 1;
            }
            return pages;
        };
        self.pages = ko.computed(function () {
            return new Array(self.pageCount() || 0);
        });
        self.prev = function () {
            if (self.pageIndex() > 0) {
                self.pageIndex(self.pageIndex() - 1);
            }
        };
        self.next = function () {
            if (self.pageIndex() < self.pageCount() - 1) {
                self.pageIndex(self.pageIndex() + 1);
            }
        };
        self.select = function (i) {
            self.pageIndex(i);
        };
    };


    ko.components.register('tbs-pager', {
        template: '<ul class="pagination"> <li> <a href="#" aria-label="Previous" data-bind="click: prev"> <span aria-hidden="true">&laquo;</span> </a> </li> <!-- ko foreach: pages --> <li data-bind="css: {active: $index() === $parent.pageIndex()}"><a href="#" data-bind="text: $index()+1, click: function () { $parent.select($index()); }"></a></li> <!-- /ko --> <li> <a href="#" aria-label="Next" data-bind="click: next"> <span aria-hidden="true">&raquo;</span> </a> </li> </ul>',
        viewModel: VM
    });

})(ko);



/**
 *  twitter bootstrap Modal custom binding.
 * 
 * 
 */
(function (ko) {
    'use strict';

    //MODAL DEFINITION
    var Modal = function (element, options) {
        options = options || {};
        this.isIE = (new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) !== null) ? parseFloat(RegExp.$1) : false;
        this.opened = false;
        this.modal = typeof element === 'object' ? element : document.querySelector(element);
        this.options = {};
        this.options.backdrop = options.backdrop === 'false' ? false : true;
        this.options.keyboard = options.keyboard === 'false' ? false : true;
        this.options.content = options.content;
        this.options.obs = options.observable;
        this.duration = options.duration || 400; // the default modal fade duration option
        this.options.duration = (this.isIE && this.isIE < 10) ? 0 : this.duration;

        this.scrollbarWidth = 0;
        this.dialog = this.modal.querySelector('.modal-dialog');
        this.timer = 0;

        this.init();
    };

    var getWindowWidth = function () {
        var htmlRect = document.documentElement.getBoundingClientRect(),
            fullWindowWidth = window.innerWidth || (htmlRect.right - Math.abs(htmlRect.left));
        return fullWindowWidth;
    };
    Modal.prototype = {

        init: function () {

            this.actions();
            if (this.options.content && this.options.content !== undefined) {
                this.content(this.options.content);
            }
        },

        actions: function () {
            var self = this;
            this.open = function () {
                this._open();
            },

            this.close = function () {
                this._close();
            },

            this._open = function () {

                if (this.options.backdrop) {
                    this.createOverlay();
                } else {
                    this.overlay = null;
                }

                if (this.overlay) {
                    setTimeout(function () {
                        self.addClass(self.overlay, 'in');
                    }, 0);
                }

                clearTimeout(self.modal.getAttribute('data-timer'));
                this.timer = setTimeout(function () {
                    self.modal.style.display = 'block';
                    self.opened = true;

                    self.checkScrollbar();
                    self.adjustDialog();
                    self.setScrollbar();

                    self.resize();
                    self.dismiss();
                    self.keydown();

                    self.addClass(document.body, 'modal-open');
                    self.addClass(self.modal, 'in');
                    self.modal.setAttribute('aria-hidden', false);
                }, self.options.duration / 2);
                this.modal.setAttribute('data-timer', self.timer);
            },

            this._close = function () {

                if (this.overlay) {
                    this.removeClass(this.overlay, 'in');
                }
                this.removeClass(this.modal, 'in');
                this.modal.setAttribute('aria-hidden', true);

                clearTimeout(self.modal.getAttribute('data-timer'));
                this.timer = setTimeout(function () {
                    self.opened = false;
                    self.removeClass(document.body, 'modal-open');
                    self.resize();
                    self.resetAdjustments();
                    self.resetScrollbar();

                    self.dismiss();
                    self.keydown();
                    self.modal.style.display = '';
                }, self.options.duration / 2);
                this.modal.setAttribute('data-timer', self.timer);

                setTimeout(function () {
                    if (!document.querySelector('.modal.in')) {
                        self.removeOverlay();
                    }
                }, self.options.duration);
            },

            this.content = function (content) {
                this.modal.querySelector('.modal-content').innerHTML = content;
                return this.modal.querySelector('.modal-content').innerHTML;
            },

            this.createOverlay = function () {
                var backdrop = document.createElement('div'),
                    overlay = document.querySelector('.modal-backdrop');
                backdrop.setAttribute('class', 'modal-backdrop fade');

                if (overlay) {
                    this.overlay = overlay;
                } else {
                    this.overlay = backdrop;
                    document.body.appendChild(backdrop);
                }
            },

            this.removeOverlay = function () {
                var overlay = document.querySelector('.modal-backdrop');
                if (overlay !== null && overlay !== undefined) {
                    document.body.removeChild(overlay);
                }
            },

            this.keydown = function () {
                function keyHandler(e) {
                    if (self.options.keyboard && e.which == 27) {
                        self.close();
                    }
                }
                if (this.opened) {
                    document.addEventListener('keydown', keyHandler, false);
                } else {
                    document.removeEventListener('keydown', keyHandler, false);
                }
            },

            this._resize = function () {
                var overlay = this.overlay || document.querySelector('.modal-backdrop'),
                    dim = {
                        w: document.documentElement.clientWidth + 'px',
                        h: document.documentElement.clientHeight + 'px'
                    };
                // setTimeout(function() {
                if (overlay !== null && /in/.test(overlay.className)) {
                    overlay.style.height = dim.h;
                    overlay.style.width = dim.w;
                }
                // }, self.options.duration/2)
            },

            this.oneResize = function () {
                function oneResize() {
                    self._resize();
                    self.handleUpdate();
                    window.removeEventListener('resize', oneResize, false);
                }
                window.addEventListener('resize', oneResize, false);
            },

            this.resize = function () {
                function resizeHandler() {
                    // setTimeout(function() {
                    self._resize();
                    self.handleUpdate();
                    console.log('offresize');
                    // }, 100)
                }

                if (this.opened) {
                    window.addEventListener('resize', this.oneResize, false);
                } else {
                    window.removeEventListener('resize', this.oneResize, false);
                }

            },

            this.dismiss = function () {
                function dismissHandler(e) {
                    if (e.target.parentNode.getAttribute('data-dismiss') === 'modal' || e.target.getAttribute('data-dismiss') === 'modal' || e.target === self.modal) {
                        e.preventDefault();
                        self.close();
                        if (self.options.obs) {
                            self.options.obs(false);
                        }
                    }
                }
                if (this.opened) {
                    this.modal.addEventListener('click', dismissHandler, false);
                } else {
                    this.modal.removeEventListener('click', dismissHandler, false);
                }
            },

            // these following methods are used to handle overflowing modals

            this.handleUpdate = function () {
                this.adjustDialog();
            },

            this.adjustDialog = function () {
                this.modal.style.paddingLeft = !this.bodyIsOverflowing && this.modalIsOverflowing ? this.scrollbarWidth + 'px' : '';
                this.modal.style.paddingRight = this.bodyIsOverflowing && !this.modalIsOverflowing ? this.scrollbarWidth + 'px' : '';

                // console.log(this.bodyIsOverflowing + ' ' + this.modal.id);
                // this.modal.offsetWidth;
            },

            this.resetAdjustments = function () {
                this.modal.style.paddingLeft = '';
                this.modal.style.paddingRight = '';
            },

            this.checkScrollbar = function () {
                this.bodyIsOverflowing = document.body.clientWidth < getWindowWidth();
                this.modalIsOverflowing = this.modal.scrollHeight > document.documentElement.clientHeight;
                this.scrollbarWidth = this.measureScrollbar();
            },

            this.setScrollbar = function () {
                var bodyStyle = window.getComputedStyle(document.body),
                    bodyPad = parseInt((bodyStyle.paddingRight), 10);
                if (this.bodyIsOverflowing) {
                    document.body.style.paddingRight = (bodyPad + this.scrollbarWidth) + 'px';
                }
            },

            this.resetScrollbar = function () {
                document.body.style.paddingRight = '';
            },

            this.measureScrollbar = function () { // thx walsh
                var scrollDiv = document.createElement('div');
                scrollDiv.className = 'modal-scrollbar-measure';
                document.body.appendChild(scrollDiv);
                var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
                document.body.removeChild(scrollDiv);
                return scrollbarWidth;
            },

            this.addClass = function (el, c) {
                if (el.classList) {
                    el.classList.add(c);
                } else {
                    el.className += ' ' + c;
                }
            },

            this.removeClass = function (el, c) {
                if (el.classList) {
                    el.classList.remove(c);
                } else {
                    el.className = el.className.replace(c, '').replace(/^\s+|\s+$/g, '');
                }
            };
        }
    };



    ko.bindingHandlers.tbsModal = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var flagObs = valueAccessor();
            var modal = new Modal(element, { observable: flagObs });
            ko.utils.domData.set(element, "modal", modal);
            if (flagObs()) {
                modal.open();
            }

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                ko.utils.domData.set(element, "modal", undefined);
            });

        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var modal = ko.utils.domData.get(element, "modal");
            var flagObs = valueAccessor();
            if (flagObs()) {
                modal.open();
            } else {
                modal.close();
            }
        }

    };


})(ko);  