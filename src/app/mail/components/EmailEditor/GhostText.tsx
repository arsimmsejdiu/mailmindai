import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import React from 'react'

// eslint-disable-next-line import/no-anonymous-default-export,react/display-name
export default (props: any) => {
  return (
    <NodeViewWrapper as="span">
      <NodeViewContent className="!inline select-none text-gray-300" as="span">
        {props.node.attrs.content}
      </NodeViewContent>
    </NodeViewWrapper>
  );
};
