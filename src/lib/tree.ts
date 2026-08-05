import type { StudyNode } from "../types";

export interface TreeNodeWithChildren extends StudyNode {
  children: TreeNodeWithChildren[];
}

export function buildTree(nodes: StudyNode[]): TreeNodeWithChildren[] {
  const map = new Map<string, TreeNodeWithChildren>();
  nodes.forEach((n) => map.set(n.id, { ...n, children: [] }));

  const roots: TreeNodeWithChildren[] = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRec = (list: TreeNodeWithChildren[]) => {
    list.sort((a, b) => a.order - b.order);
    list.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);

  return roots;
}
