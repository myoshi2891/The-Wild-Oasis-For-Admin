import type { ReactNode } from "react";
import styled from "styled-components";

const StyledDataItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1.6rem;
  padding: 0.8rem 0;
`;

const Label = styled.span`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 500;

  & svg {
    width: 2rem;
    height: 2rem;
    color: var(--color-brand-600);
  }
`;

interface DataItemProps {
	icon: ReactNode;
	label: string;
	children: ReactNode;
}

/**
 * Render a horizontal data row displaying an icon, a label, and accompanying content.
 *
 * @param icon - Visual element shown to the left of the label (e.g., an SVG or React icon).
 * @param label - Text displayed next to the icon.
 * @param children - Content displayed to the right of the label (detail or value).
 * @returns The styled data item element containing the icon, label, and children.
 */
function DataItem({ icon, label, children }: DataItemProps) {
  return (
    <StyledDataItem>
      <Label>
        {icon}
        <span>{label}</span>
      </Label>
      {children}
    </StyledDataItem>
  );
}

export default DataItem;
