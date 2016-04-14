/*
 * Copyright (C) 2015 - 2016 Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Component, OnInit} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {RouteParams} from 'angular2/router';

import BuecherService from '../../service/buecher_service';
import Buch from '../../model/buch';
import Stammdaten from './stammdaten';
import Schlagwoerter from './schlagwoerter';
import {isAdmin} from '../../../iam/iam';
import {isString, Waiting, ErrorMessage} from '../../../shared/shared';

/**
 * Komponente f&uuml;r das Tag <code>details-buch</code>
 */
@Component({
    selector: 'details-buch',
    directives:
        [CORE_DIRECTIVES, Stammdaten, Schlagwoerter, Waiting, ErrorMessage],
    template: `
        <waiting [activated]="waiting"></waiting>

        <section *ngIf="buch !== null">
            <h4>Buch {{buch._id}}:</h4>

            <!-- http://v4-alpha.getbootstrap.com/components/navs/#tabs -->
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link active" href="#stammdaten"
                       data-toggle="tab">
                        Stammdaten
                    </a>
                </li>
                <li class="nav-item" *ngIf="buch.hasSchlagwoerter()">
                    <a class="nav-link" href="#schlagwoerter"
                       data-toggle="tab">
                        Schlagw&ouml;rter
                    </a>
                </li>
            </ul>

            <div class="tab-content">
                <div class="tab-pane fade in active" id="stammdaten">
                    <div class="m-t-1">
                        <stammdaten [buch]="buch"></stammdaten>
                    </div>
                </div>
                <div class="tab-pane fade" id="schlagwoerter"
                    *ngIf="buch.hasSchlagwoerter()">
                    <div class="m-t-1">
                        <schlagwoerter [values]="buch.schlagwoerter">
                        </schlagwoerter>
                    </div>
                </div>
            </div>

            <div>
                &nbsp;
                <a [routerLink]="['UpdateBuch', {'id': buch._id}]"
                   data-toggle="tooltip" title="Bearbeiten"
                   *ngIf="isAdmin()">
                   <i class="fa fa-2x fa-edit"></i>
                </a>
            </div>
        </section>

        <error-message [text]="errorMsg"></error-message>
    `
})
export default class DetailsBuch implements OnInit {
    waiting: boolean = false;
    buch: Buch = null;
    errorMsg: string = null;

    constructor(
        private _buecherService: BuecherService,
        private _routeParams: RouteParams) {
        console.log('DetailsBuch.constructor(): routeParams=', _routeParams);
    }

    // Methode zum "LifeCycle Hook" OnInit: wird direkt nach dem Konstruktor
    // aufgerufen: node_modules\angular2\ts\src\core\linker\interfaces.ts
    ngOnInit(): void {
        this._observeBuch();
        this._observeError();

        // Pfad-Parameter aus /detailsBuch/:_id
        const id: string = this._routeParams.params['id'];
        console.log(`DetailsBuch.ngOnInit(): id= ${id}`);
        this._buecherService.findById(id);
    }

    isAdmin(): boolean { return isAdmin(); }

    /* tslint:disable:align */
    private _observeBuch(): void {
        this._buecherService.observeBuch((buch: Buch) => {
            this.waiting = false;
            this.buch = buch;
            console.log('DetailsBuch.buch=', this.buch);
        }, this);
    }

    private _observeError(): void {
        this._buecherService.observeError((err: string | number) => {
            this.waiting = false;
            if (err === null) {
                this.errorMsg = 'Ein Fehler ist aufgetreten.';
                return;
            }

            if (isString(err)) {
                this.errorMsg = <string>err;
                return;
            }

            switch (err) {
                case 404:
                    this.errorMsg = 'Kein Buch gefunden.';
                    break;
                default:
                    this.errorMsg = 'Ein Fehler ist aufgetreten.';
                    break;
            }
            console.log(`DetailsBuch.errorMsg: ${this.errorMsg}`);
        }, this);
    }
    /* tslint:enable:align */
}
