import { Directive, HostListener } from '@angular/core'
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';

@Directive({
    selector: 'input[ngbtypeaheadpopup]'
})
export class TypeaheadPopupDirective {

    @HostListener('focus', ['$event.target'])
    @HostListener('click', ['$event.target'])

    onClick(t) {
        if (!this.typeahead.isPopupOpen()) {
            t.dispatchEvent(new Event('input'))
        };
    }

    constructor(private typeahead: NgbTypeahead) {
    }

}