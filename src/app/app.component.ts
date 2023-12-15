import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import * as createjs from 'createjs-module';
import AccessibilityModule from '@curriculumassociates/createjs-accessibility';
import { CanvasUtilitiesService } from './canvas-utilities.service';
import * as $ from 'jquery';

@Component( {
	selector: 'app-root',
	standalone: true,
	imports: [ CommonModule, RouterOutlet ],
	templateUrl: './app.component.html',
	styleUrl: './app.component.css'
} )
export class AppComponent implements AfterViewInit {
	width: number | undefined = 600;
	height: number | undefined = 400;
	stage: createjs.Stage | undefined;
	root: createjs.Container = new createjs.Container();
	cardWidth = 140;
	cardHeight = 100;

	@ViewChild( 'canvas', { read: ElementRef } ) canvas: ElementRef | undefined;
	@ViewChild( 'adaWrapper', { read: ElementRef } ) adaWrapper: ElementRef | undefined;

	constructor( public canvasUtils: CanvasUtilitiesService ) {}

	public ngAfterViewInit() {
		this.stage = new createjs.Stage( this.canvas?.nativeElement );
		this.stage.addChild( this.root );

		createjs.Ticker.addEventListener( 'tick', this.updateStage );

		this.canvasUtils.initializeCanvas( this.stage, this.canvas.nativeElement );

		this.initializeAda();
		this.drawBlocks();
	}

	@HostListener( 'window:resize' )
	public resize() {
		let resizeTime: Date;
		let resizeTimeout = false;
		const delta = 1;

		resizeTime = new Date();
		if ( !resizeTimeout ) {
			resizeTimeout = true;
			if ( ( new Date().getTime() - resizeTime.getTime() ) < delta ) {
				setTimeout( () => {
					resizeTimeout = false;
					this.gameResize();
				}, delta );
			}
		}
	}

	public gameResize = (): void => {
		if ( !!this.stage === false ) {
			return;
		}
		this.canvasUtils.resizeCanvas( this.stage, this.canvas.nativeElement, 0, true );
		this.updateStage();
		AccessibilityModule.resize( this.stage );
	};

	drawBlocks() {
		for ( let row = 0; row < 4; row++ ) {
			for ( let col = 0; col < 4; col++ ) {
				var card = new createjs.Container();
				var shape = new createjs.Shape();

				card.addChild( shape );
				this.drawShape( shape );
				this.positionShape( card, row, col );

				this.root.addChild( card );

				var text = new createjs.Text();
				text.text = "block " + row + "-" + col;
				card.addChild( text );

				AccessibilityModule.register( {
					displayObject: card,
					parent: this.root,
					key: row + col,
					role: AccessibilityModule.ROLES.BUTTON,
					accessibleOptions: {
						text: ( 'block' + row + col )
					}
				} );
			}
		}
	}

	updateStage = (): void => {
		if ( !!this.stage ) {
			this.stage.update();
			const adaStage = this.stage as any;
			adaStage.accessibilityTranslator?.update();
		}
	};

	drawShape = ( shape: createjs.Shape ): void => {
		let startColor;
		let endColor;
		const width = this.cardWidth;
		const height = this.cardHeight;

		startColor = '#64747d';
		endColor = '#4e565a'

		shape.graphics.clear();
		shape.graphics.beginStroke( '#000000' )
		.setStrokeStyle( 1 )
		.beginLinearGradientFill( [ startColor, endColor ], [ 0, 1 ], 0, 0, 0, width )
		.drawRect( 0, 0, width, height );
	};

	positionShape = ( card: createjs.Container, row: number, col: number ) => {
		var xpos = this.cardWidth * row;
		var ypos = this.cardHeight * col;
		card.x = xpos;
		card.y = ypos;
	}

	initializeAda() {
		AccessibilityModule.register( {
			displayObject: this.root,
			role: AccessibilityModule.ROLES.NONE
		} );
		const onReady = () => {
			( this.stage as any ).accessibilityTranslator.root = this.root;
		};
		AccessibilityModule.setupStage( this.stage, this.adaWrapper?.nativeElement, onReady );
	}
}
