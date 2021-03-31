import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
@Injectable()
export class MessageService {

    public originToken: string = '';
    public destinationToken: string = '';

    private siblingMsg = new Subject<string[]>();
    constructor() { }

    /*
     * @return {Observable<string>} : siblingMsg
     */
    public getMessage(): Observable<string[]> {
        return this.siblingMsg.asObservable();
    }

    /*
     * @param {string} message : siblingMsg
     */
    public updateMessage(message: string[]): void {
        if (message[0] == 'origin') {
            this.originToken = message[1];
        } else if (message[0] == 'destination') {
            this.destinationToken = message[1];
        }
        this.siblingMsg.next(message);
    }
}