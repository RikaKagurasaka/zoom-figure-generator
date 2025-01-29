import {
  useDraggable,
  useElementBounding,
  useElementByPoint,
  useEventListener,
  useMouse,
  watchDebounced,
} from "@vueuse/core";
import {
  computed,
  defineComponent,
  ref,
  toValue,
  watch,
  type CSSProperties,
  type MaybeRefOrGetter,
  type Ref,
} from "vue";

function calcScale(svg: SVGSVGElement) {
  const bounding = svg.getBoundingClientRect();
  const viewBox = svg.viewBox.baseVal;
  return Math.min(
    bounding.width / viewBox.width,
    bounding.height / viewBox.height
  );
}

export function useDraggableSvg(
  rect: Ref<SVGRectElement | undefined>,
  svg: Ref<SVGSVGElement | undefined>,
  rectConf: { x: number; y: number; width: number; height: number }
) {
  const { x: mouseX, y: mouseY } = useMouse();
  const lastMouseX = ref(0);
  const lastMouseY = ref(0);

  useDraggable(rect, {
    onStart: () => {
      lastMouseX.value = mouseX.value;
      lastMouseY.value = mouseY.value;
    },
    onMove: () => {
      const scale = calcScale(toValue(svg)!);
      rectConf.x += (mouseX.value - lastMouseX.value) / scale;
      rectConf.y += (mouseY.value - lastMouseY.value) / scale;
      rectConf.y = Math.max(0, rectConf.y);
      rectConf.x = Math.max(0, rectConf.x);

      rectConf.x = Math.min(
        rectConf.x,
        -rectConf.width + svg.value!.viewBox.baseVal.width
      );
      rectConf.y = Math.min(
        rectConf.y,
        -rectConf.height + svg.value!.viewBox.baseVal.height
      );

      rectConf.x = Math.round(rectConf.x * 100) / 100;
      rectConf.y = Math.round(rectConf.y * 100) / 100;

      lastMouseX.value = mouseX.value;
      lastMouseY.value = mouseY.value;
    },
    onEnd: () => {
      lastMouseX.value = mouseX.value;
      lastMouseY.value = mouseY.value;
    },
  });
}

export function useResizeableSvg(
  rect: Ref<SVGRectElement | undefined>,
  rectConf: { x: number; y: number; width: number; height: number },
  allowPopping: boolean = false
) {
  const { element } = useElementByPoint({
    ...useMouse(),
  }) as { element: Ref<HTMLElement | SVGElement | null> };
  useEventListener(window, "keydown", (e) => {
    if (element.value !== rect.value) {
      if (allowPopping) {
        if (!rect.value?.contains(element.value!)) {
          return;
        }
      } else return;
    }
    if (["+", "=", "w", "d"].includes(e.key.toLowerCase())) {
      rectConf.width *= 1.05;
      rectConf.height *= 1.05;
      rectConf.width = Math.round(rectConf.width * 100) / 100;
      rectConf.height = Math.round(rectConf.height * 100) / 100;
    }
    if (["-", "_", "s", "a"].includes(e.key.toLowerCase())) {
      rectConf.width *= 0.95;
      rectConf.height *= 0.95;
      rectConf.width = Math.round(rectConf.width * 100) / 100;
      rectConf.height = Math.round(rectConf.height * 100) / 100;
    }
  });
}

export function useMagnifiedImg(
  imgUrl: Ref<string>,
  conf: MaybeRefOrGetter<{
    sRect: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    lRect: {
      width: number;
      height: number;
    };
  }>
) {
  const magnifiedImage = ref<string>("");

  watchDebounced(
    [imgUrl, () => toValue(conf)],
    async ([url, config]) => {
      if (!url) return;

      // Create source image
      const img = new Image();
      img.src = url;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Create canvas for cutting and resizing
      const canvas = document.createElement("canvas");
      canvas.width = config.lRect.width;
      canvas.height = config.lRect.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw the selected portion scaled to target size
      ctx.drawImage(
        img,
        config.sRect.x,
        config.sRect.y,
        config.sRect.width,
        config.sRect.height,
        0,
        0,
        config.lRect.width,
        config.lRect.height
      );

      // Convert to base64
      magnifiedImage.value = canvas.toDataURL();
    },
    { immediate: true, deep: true, debounce: 200 }
  );

  return {
    magnifiedImage,
  };
}

interface Point {
  x: number;
  y: number;
}

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Edge extends Line {
  p1: Point;
  p2: Point;
}

interface IntersectionResult {
  intersection: Point | null;
  edgePoints: { p1: Point; p2: Point } | null;
}

export function useConnectLines(
  conf: MaybeRefOrGetter<{
    sRect: Rectangle;
    lRect: Rectangle;
  }>
) {
  function getEdgesForRect(rect: Rectangle): Edge[] {
    return [
      // Top edge
      {
        x1: rect.x,
        y1: rect.y,
        x2: rect.x + rect.width,
        y2: rect.y,
        p1: { x: rect.x, y: rect.y },
        p2: { x: rect.x + rect.width, y: rect.y },
      },
      // Right edge
      {
        x1: rect.x + rect.width,
        y1: rect.y,
        x2: rect.x + rect.width,
        y2: rect.y + rect.height,
        p1: { x: rect.x + rect.width, y: rect.y },
        p2: { x: rect.x + rect.width, y: rect.y + rect.height },
      },
      // Bottom edge
      {
        x1: rect.x,
        y1: rect.y + rect.height,
        x2: rect.x + rect.width,
        y2: rect.y + rect.height,
        p1: { x: rect.x, y: rect.y + rect.height },
        p2: { x: rect.x + rect.width, y: rect.y + rect.height },
      },
      // Left edge
      {
        x1: rect.x,
        y1: rect.y,
        x2: rect.x,
        y2: rect.y + rect.height,
        p1: { x: rect.x, y: rect.y },
        p2: { x: rect.x, y: rect.y + rect.height },
      },
    ];
  }

  function findIntersection(line: Line, rect: Rectangle): IntersectionResult {
    if (!isValidLine(line) || !isValidRect(rect)) {
      return { intersection: null, edgePoints: null };
    }

    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;
    const edges = getEdgesForRect(rect);

    let closestIntersection: Point | null = null;
    let minDistance = Infinity;
    let intersectEdgePoints: { p1: Point; p2: Point } | null = null;

    for (const edge of edges) {
      const intersection = findLineIntersection(edge, { dx, dy, ...line });
      if (!intersection) continue;

      const distance = getDistance(
        line.x1,
        line.y1,
        intersection.x,
        intersection.y
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestIntersection = intersection;
        intersectEdgePoints = { p1: edge.p1, p2: edge.p2 };
      }
    }

    return {
      intersection: closestIntersection,
      edgePoints: intersectEdgePoints,
    };
  }

  function findLineIntersection(
    edge: Edge,
    line: Line & { dx: number; dy: number }
  ) {
    const denominator =
      (line.x2 - line.x1) * (edge.y2 - edge.y1) -
      (line.y2 - line.y1) * (edge.x2 - edge.x1);

    if (denominator === 0) return null;

    const t =
      ((edge.x2 - edge.x1) * (line.y1 - edge.y1) -
        (edge.y2 - edge.y1) * (line.x1 - edge.x1)) /
      denominator;

    const u =
      ((line.x2 - line.x1) * (line.y1 - edge.y1) -
        (line.y2 - line.y1) * (line.x1 - edge.x1)) /
      denominator;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: line.x1 + t * (line.x2 - line.x1),
        y: line.y1 + t * (line.y2 - line.y1),
      };
    }

    return null;
  }

  function doLinesIntersect(l1: Line, l2: Line): boolean {
    if (!isValidLine(l1) || !isValidLine(l2)) return false;

    const denominator =
      (l2.y2 - l2.y1) * (l1.x2 - l1.x1) - (l2.x2 - l2.x1) * (l1.y2 - l1.y1);

    if (denominator === 0) return false;

    const ua =
      ((l2.x2 - l2.x1) * (l1.y1 - l2.y1) - (l2.y2 - l2.y1) * (l1.x1 - l2.x1)) /
      denominator;
    const ub =
      ((l1.x2 - l1.x1) * (l1.y1 - l2.y1) - (l1.y2 - l1.y1) * (l1.x1 - l2.x1)) /
      denominator;

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }

  function getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  function getCenterPoint(rect: Rectangle): Point {
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    };
  }

  function isValidLine(line: Line): boolean {
    return (
      !isNaN(line.x1) && !isNaN(line.y1) && !isNaN(line.x2) && !isNaN(line.y2)
    );
  }

  function isValidRect(rect: Rectangle): boolean {
    return (
      !isNaN(rect.x) &&
      !isNaN(rect.y) &&
      !isNaN(rect.width) &&
      !isNaN(rect.height) &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  const segments = computed(() => {
    const config = toValue(conf);
    if (!isValidRect(config.sRect) || !isValidRect(config.lRect)) {
      return [
        { x1: 0, y1: 0, x2: 0, y2: 0 },
        { x1: 0, y1: 0, x2: 0, y2: 0 },
      ];
    }

    const sCenter = getCenterPoint(config.sRect);
    const lCenter = getCenterPoint(config.lRect);

    const centerLine: Line = {
      x1: sCenter.x,
      y1: sCenter.y,
      x2: lCenter.x,
      y2: lCenter.y,
    };

    const sResult = findIntersection(centerLine, config.sRect);
    const lResult = findIntersection(
      {
        ...centerLine,
        x1: lCenter.x,
        y1: lCenter.y,
        x2: sCenter.x,
        y2: sCenter.y,
      },
      config.lRect
    );

    let srp1 = sResult.edgePoints?.p1;
    let srp2 = sResult.edgePoints?.p2;
    let lrp1 = lResult.edgePoints?.p1;
    let lrp2 = lResult.edgePoints?.p2;

    if (srp1 && srp2 && lrp1 && lrp2) {
      const line1: Line = {
        x1: srp1.x,
        y1: srp1.y,
        x2: lrp1.x,
        y2: lrp1.y,
      };
      const line2: Line = {
        x1: srp2.x,
        y1: srp2.y,
        x2: lrp2.x,
        y2: lrp2.y,
      };

      if (doLinesIntersect(line1, line2)) {
        [lrp1, lrp2] = [lrp2, lrp1];
      }
    }

    return [
      {
        x1: srp1?.x ?? sCenter.x,
        y1: srp1?.y ?? sCenter.y,
        x2: lrp1?.x ?? lCenter.x,
        y2: lrp1?.y ?? lCenter.y,
      },
      {
        x1: srp2?.x ?? sCenter.x,
        y1: srp2?.y ?? sCenter.y,
        x2: lrp2?.x ?? lCenter.x,
        y2: lrp2?.y ?? lCenter.y,
      },
    ];
  });

  return {
    segments,
  };
}

export type LegendConfig = {
  enable: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  colors: string[][];
  labels: { text: string; family: string; variant: string }[];
};

export type ScaleConfig = {
  enable: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  line: {
    stroke: string;
    strokeWidth: number;
  };
  rect: {
    fill: string;
  };
  text: {
    fill: string;
    fontFamily: string;
    fontSize: number;
    text: string;
  };
};
