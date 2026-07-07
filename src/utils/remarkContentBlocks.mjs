const CARD_TONES = new Set(["green", "blue", "purple", "gray"]);
const CARD_ICONS = {
  question: "?",
  info: "i",
  warning: "!",
  none: "",
};

function className(...names) {
  return names.filter(Boolean).join(" ");
}

function elementNode(type, hName, hProperties, children = []) {
  return {
    type,
    data: {
      hName,
      hProperties,
    },
    children,
  };
}

function textElementNode(type, hName, hProperties, value) {
  return {
    type,
    value,
    data: {
      hName,
      hProperties,
      hChildren: [{ type: "text", value }],
    },
  };
}

function normalizeTone(tone) {
  return CARD_TONES.has(tone) ? tone : "green";
}

function normalizeIcon(icon) {
  return Object.hasOwn(CARD_ICONS, icon) ? icon : "question";
}

function visit(node) {
  if (!node || typeof node !== "object") return;

  if (node.type === "containerDirective" && node.name === "card") {
    const attributes = node.attributes || {};
    const tone = normalizeTone(attributes.tone);
    const icon = normalizeIcon(attributes.icon);
    const title = String(attributes.title || "").trim();
    const originalChildren = Array.isArray(node.children) ? node.children : [];
    const children = [];

    node.type = "mdCard";
    node.data = {
      hName: "section",
      hProperties: {
        className: className("md-card", `md-card--${tone}`),
      },
    };

    if (title) {
      const headerChildren = [];
      const iconValue = CARD_ICONS[icon];

      if (iconValue) {
        headerChildren.push(
          textElementNode(
            "mdCardIcon",
            "span",
            {
              className: className("md-card__icon", `md-card__icon--${icon}`),
              ariaHidden: "true",
            },
            iconValue,
          ),
        );
      }

      headerChildren.push(
        textElementNode(
          "mdCardTitle",
          "span",
          { className: "md-card__title" },
          title,
        ),
      );

      children.push(
        elementNode(
          "mdCardHeader",
          "div",
          { className: "md-card__header" },
          headerChildren,
        ),
      );
    }

    children.push(
      elementNode(
        "mdCardBody",
        "div",
        { className: "md-card__body" },
        originalChildren,
      ),
    );

    node.children = children;
    return;
  }

  if (!Array.isArray(node.children)) return;

  for (const child of node.children) {
    visit(child);
  }
}

export default function remarkContentBlocks() {
  return (tree) => {
    visit(tree);
  };
}
