import {
  BasePlugin,
  GraphEvent,
  type IAnimateEvent,
  type RuntimeContext,
} from "@antv/g6";
import { AnimationType } from "@antv/g6/lib/constants";
import { createPluginContainer } from "@antv/g6/lib/plugins/utils/dom";
import { isBoolean } from "@antv/util";

interface DotsGridOptions {
  key?: string;
  type: string;
  size?: number;
  dotColor?: string;
  dotRadius?: number;
  backgroundColor?: string;
  zIndex?: string;
  border?: boolean;
  borderLineWidth?: number;
  borderStroke?: string;
  borderStyle?: string;
  follow?: boolean | { translate?: boolean; zoom?: boolean };
}

export class DotsGrid extends BasePlugin<DotsGridOptions> {
  static defaultOptions: Partial<DotsGridOptions> = {
    type: "dots-grid",
    size: 20,
    dotColor: "#e5e7eb",
    dotRadius: 1,
    backgroundColor: "transparent",
    zIndex: "-1",
    border: false,
    borderLineWidth: 1,
    borderStroke: "#eee",
    borderStyle: "solid",
    follow: true,
  };

  private $element: HTMLElement = createPluginContainer("dots-grid");
  private svg!: SVGSVGElement;
  private pattern!: SVGPatternElement;
  private bgRect!: SVGRectElement;
  private dotsRect!: SVGRectElement;
  private dot!: SVGCircleElement;
  private baseSize: number;
  private patternId: string;
  private animationFrameId: number | null = null;
  private syncingDuringTransformAnimation = false;

  constructor(context: RuntimeContext, options: DotsGridOptions) {
    super(context, Object.assign({}, DotsGrid.defaultOptions, options));

    const $container = this.context.canvas.getContainer();
    $container!.prepend(this.$element);

    this.baseSize = this.options.size ?? 20;
    this.patternId = `dots-grid-pattern-${Math.random().toString(36).slice(2, 10)}`;

    this.createSvgLayer();
    this.updateStyle();
    this.bindEvents();
  }

  public update(options: Partial<DotsGridOptions>) {
    super.update(options);
    if (options.size !== undefined) this.baseSize = options.size;
    this.updateStyle();
  }

  private createSvgLayer() {
    const ns = "http://www.w3.org/2000/svg";
    this.svg = document.createElementNS(ns, "svg");
    const defs = document.createElementNS(ns, "defs");
    this.pattern = document.createElementNS(ns, "pattern");
    this.dot = document.createElementNS(ns, "circle");
    this.bgRect = document.createElementNS(ns, "rect");
    this.dotsRect = document.createElementNS(ns, "rect");

    this.pattern.setAttribute("id", this.patternId);
    this.pattern.setAttribute("patternUnits", "userSpaceOnUse");
    this.pattern.appendChild(this.dot);
    defs.appendChild(this.pattern);

    this.bgRect.setAttribute("x", "0");
    this.bgRect.setAttribute("y", "0");
    this.bgRect.setAttribute("width", "100%");
    this.bgRect.setAttribute("height", "100%");

    this.dotsRect.setAttribute("x", "0");
    this.dotsRect.setAttribute("y", "0");
    this.dotsRect.setAttribute("width", "100%");
    this.dotsRect.setAttribute("height", "100%");
    this.dotsRect.setAttribute("fill", `url(#${this.patternId})`);

    this.svg.appendChild(defs);
    this.svg.appendChild(this.bgRect);
    this.svg.appendChild(this.dotsRect);
    this.$element.appendChild(this.svg);
  }

  private bindEvents() {
    const { graph } = this.context;
    graph.on(GraphEvent.AFTER_RENDER, this.onRender);
    graph.on(GraphEvent.AFTER_TRANSFORM, this.onTransform);
    graph.on(GraphEvent.BEFORE_ANIMATE, this.onBeforeAnimate);
    graph.on(GraphEvent.AFTER_ANIMATE, this.onAfterAnimate);
  }

  private parseFollow(follow: DotsGridOptions["follow"]) {
    return isBoolean(follow)
      ? { translate: follow, zoom: follow }
      : { translate: follow?.translate ?? false, zoom: follow?.zoom ?? false };
  }

  private syncFromViewport(followZoom: boolean, followTranslate: boolean) {
    const graph = this.context.graph;
    const viewport = this.context.viewport;
    const zoom = followZoom ? (viewport?.getZoom() ?? 1) : 1;
    const scale = zoom;
    const [x, y] =
      followTranslate && viewport ? graph.getViewportByCanvas([0, 0]) : [0, 0];

    this.pattern.setAttribute("width", `${this.baseSize}`);
    this.pattern.setAttribute("height", `${this.baseSize}`);
    this.pattern.setAttribute(
      "patternTransform",
      `matrix(${scale} 0 0 ${scale} ${x} ${y})`,
    );
  }

  private updateStyle() {
    const {
      dotColor,
      dotRadius,
      backgroundColor,
      zIndex,
      border,
      borderLineWidth,
      borderStroke,
      borderStyle,
    } = this.options;

    Object.assign(this.$element.style, {
      zIndex,
      border: border
        ? `${borderLineWidth}px ${borderStyle} ${borderStroke}`
        : "none",
      backgroundColor,
    });

    Object.assign(this.svg.style, {
      width: "100%",
      height: "100%",
      display: "block",
      pointerEvents: "none",
    });

    this.bgRect.setAttribute("fill", backgroundColor ?? "transparent");
    const cellCenter = this.baseSize / 2;
    this.dot.setAttribute("cx", `${cellCenter}`);
    this.dot.setAttribute("cy", `${cellCenter}`);
    this.dot.setAttribute("r", `${dotRadius ?? 1}`);
    this.dot.setAttribute("fill", dotColor ?? "#e5e7eb");

    const follow = this.parseFollow(this.options.follow);
    this.syncFromViewport(follow.zoom, follow.translate);
  }

  private onTransform = () => {
    const follow = this.parseFollow(this.options.follow);
    this.syncFromViewport(follow.zoom, follow.translate);
  };

  private onRender = () => {
    const follow = this.parseFollow(this.options.follow);
    this.syncFromViewport(follow.zoom, follow.translate);
  };

  private ensureAnimationSyncLoop(
    followZoom: boolean,
    followTranslate: boolean,
  ) {
    if (this.animationFrameId !== null) return;

    const tick = () => {
      this.syncFromViewport(followZoom, followTranslate);
      if (this.syncingDuringTransformAnimation) {
        this.animationFrameId = requestAnimationFrame(tick);
      } else {
        this.animationFrameId = null;
      }
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  private onBeforeAnimate = (event: IAnimateEvent) => {
    if (event.animationType !== AnimationType.TRANSFORM) return;
    const follow = this.parseFollow(this.options.follow);
    this.syncingDuringTransformAnimation = true;
    this.ensureAnimationSyncLoop(follow.zoom, follow.translate);
  };

  private onAfterAnimate = (event: IAnimateEvent) => {
    if (event.animationType !== AnimationType.TRANSFORM) return;
    this.syncingDuringTransformAnimation = false;
    const follow = this.parseFollow(this.options.follow);
    this.syncFromViewport(follow.zoom, follow.translate);
  };

  public destroy(): void {
    const { graph } = this.context;
    graph.off(GraphEvent.AFTER_RENDER, this.onRender);
    graph.off(GraphEvent.AFTER_TRANSFORM, this.onTransform);
    graph.off(GraphEvent.BEFORE_ANIMATE, this.onBeforeAnimate);
    graph.off(GraphEvent.AFTER_ANIMATE, this.onAfterAnimate);
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    super.destroy();
    this.$element.remove();
  }
}
