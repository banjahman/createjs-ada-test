import { Injectable } from '@angular/core';
import * as createjs from 'createjs-module';
import * as $ from 'jquery';

@Injectable( {
	providedIn: 'root'
} )
export class CanvasUtilitiesService {

	constructor() { }

	public autoScaleCanvas = ( stage: createjs.Stage, setScaled: boolean, stageWidth?: number, stageHeight?: number ): void => {
		let canvas: any = stage.canvas;
		let context: any = canvas.getContext( '2d' );
		const backingStoreRatio = context.webkitBackingStorePixelRatio ||
			context.mozBackingStorePixelRatio ||
			context.msBackingStorePixelRatio ||
			context.oBackingStorePixelRatio ||
			context.backingStorePixelRatio ||
			1;
		const devicePixelRatio: number = window.devicePixelRatio || 1;

		// scale if backingStoreRatio is not present.. Macbook pros have this and it scales automatically
		if ( backingStoreRatio < 2 ) {
			const ratio = devicePixelRatio / backingStoreRatio;
			// grab the width and height from canvas
			const height = !!stageHeight ? stageHeight : canvas.getAttribute( 'height' );
			const width = !!stageWidth ? stageWidth : canvas.getAttribute( 'width' );
			// reset the canvas width and height with window.devicePixelRatio applied
			canvas.setAttribute( 'width', Math.round( width * ratio ) );
			canvas.setAttribute( 'height', Math.round( height * ratio ) );
			// force the canvas back to the original size using css
			canvas.style.width = width + 'px';
			canvas.style.height = height + 'px';
			// render the stage scaled
			if ( !!setScaled ) {
				stage.scaleX = stage.scaleY = ratio;
			}
		}

		canvas = null;
		context = null;
	};

	public initializeCanvas = ( stage: createjs.Stage, element: HTMLElement ): any => {
		// initialize a createjs stage on this canvas
		let $el = $( element );
		let $obj: any = $el.get( 0 );
		$el.attr( {
			'data-width': $obj.width,
			'data-height': $obj.height
		} );
		this.autoScaleCanvas( stage, true, $obj.width, $obj.height );
		$el = null;
		$obj = null;
	};

	public resizeCanvas = ( stage: createjs.Stage, element: HTMLElement, startAtY: number, retainAspectRatio: boolean = false ) => {
		const $el = $( element );
		const $obj: any = $el.get( 0 );
		const $parent = $el.parent();
		this.resizeEvent( $obj, $parent, $el, stage, startAtY, retainAspectRatio );
	};

	private resizeEvent = ( $obj, $parent, $el, stage, startAtY: number, retainAspectRatio: boolean = false ): void => {
		this.sizeCanvasContents( stage, $el, $obj, $parent, startAtY, retainAspectRatio );
	};

	private sizeCanvasContents = ( stage, $el, $obj, $parent, startAtY: number, retainAspectRatio: boolean = false ): void => {
		if ( stage.children.length === 0 ) {
			return;
		}
		const devicePixelRatio = this.getDevicePixelRatio( stage.canvas );
		const scaleTo = { x: devicePixelRatio, y: devicePixelRatio };
		const wrapper = stage.children[ 0 ];

		$obj.width = $el.attr( 'data-width' );
		$obj.height = $el.attr( 'data-height' );

		// make sure the new dimensions fit inside the parent container
		if ( $parent.width() < $obj.width ) {
			$obj.width = $parent.width();
		}
		if ( $parent.height() < $obj.height ) {
			$obj.height = $parent.height();
		}

		if ( wrapper.getTransformedBounds() === null ) {
			wrapper.setBounds( 0, 0, +( $el.attr( 'data-width' ) ), +( $el.attr( 'data-height' ) ) );
		}

		this.scaleAction( wrapper, startAtY, scaleTo, stage, retainAspectRatio );
		this.autoScaleCanvas( stage, true, $parent.width(), $parent.height() );
	};

	private scaleAction( wrapper, startAtY, scaleTo, stage, retainAspectRatio: boolean = false ) {
		let currentSize = wrapper.getTransformedBounds();
		let currentWidth = 0;
		let currentHeight = 0;
		let elWidth = 0;
		let elHeight = 0;

		do {
			wrapper.setTransform( 0, startAtY, scaleTo.x, scaleTo.y );
			currentSize = wrapper.getTransformedBounds();

			elWidth = stage.canvas.width;
			elHeight = stage.canvas.height;

			if ( currentSize === null ) {
				break;
			} else {
				currentWidth = currentSize.width;
				currentHeight = currentSize.height + startAtY;

				if ( !retainAspectRatio ) {
					if ( currentWidth > elWidth ) {
						scaleTo.x -= .01;
					}
					if ( currentHeight > elHeight ) {
						scaleTo.y -= .01;
					}
				} else {
					if ( currentWidth > elWidth || currentHeight > elHeight ) {
						scaleTo.x -= .01;
						scaleTo.y -= .01;
					}
				}
			}

		} while ( ( currentWidth > elWidth || currentHeight > elHeight ) && scaleTo.x > 0 );
	}

	public getDevicePixelRatio = ( canvas: any ): number => {
		let context = canvas.getContext( '2d' );
		const backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio ||
			context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
		const devicePixelRatio = window.devicePixelRatio || 1;
		context = null;
		if ( devicePixelRatio !== backingStoreRatio ) {
			return devicePixelRatio / backingStoreRatio;
		} else {
			return devicePixelRatio;
		}
	}
}
