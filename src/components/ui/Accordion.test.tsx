import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AccordionItem } from './Accordion';

afterEach(() => cleanup());

describe('AccordionItem', () => {
  it('renders header always', () => {
    render(
      <AccordionItem expanded={false} onToggle={() => {}} header={<span>HEAD</span>}>
        <span>BODY</span>
      </AccordionItem>,
    );
    expect(screen.getByText('HEAD')).toBeTruthy();
  });

  it('hides body when expanded=false', () => {
    render(
      <AccordionItem expanded={false} onToggle={() => {}} header={<span>HEAD</span>}>
        <span>BODY</span>
      </AccordionItem>,
    );
    expect(screen.queryByText('BODY')).toBeNull();
  });

  it('shows body when expanded=true', () => {
    render(
      <AccordionItem expanded={true} onToggle={() => {}} header={<span>HEAD</span>}>
        <span>BODY</span>
      </AccordionItem>,
    );
    expect(screen.getByText('BODY')).toBeTruthy();
  });

  it('calls onToggle when header button clicked', () => {
    const onToggle = vi.fn();
    render(
      <AccordionItem expanded={false} onToggle={onToggle} header={<span>HEAD</span>}>
        <span>BODY</span>
      </AccordionItem>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('sets aria-expanded correctly', () => {
    const { rerender } = render(
      <AccordionItem expanded={false} onToggle={() => {}} header={<span>HEAD</span>}>
        <span>BODY</span>
      </AccordionItem>,
    );
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false');

    rerender(
      <AccordionItem expanded={true} onToggle={() => {}} header={<span>HEAD</span>}>
        <span>BODY</span>
      </AccordionItem>,
    );
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('true');
  });

  it('shows ▶ when collapsed and ▼ when expanded', () => {
    const { rerender } = render(
      <AccordionItem expanded={false} onToggle={() => {}} header={<span>HEAD</span>}>
        <span>BODY</span>
      </AccordionItem>,
    );
    expect(screen.getByRole('button').textContent).toContain('▶');

    rerender(
      <AccordionItem expanded={true} onToggle={() => {}} header={<span>HEAD</span>}>
        <span>BODY</span>
      </AccordionItem>,
    );
    expect(screen.getByRole('button').textContent).toContain('▼');
  });

  it('links button to body via aria-controls', () => {
    render(
      <AccordionItem expanded={true} onToggle={() => {}} header={<span>H</span>}>
        body content
      </AccordionItem>,
    );
    const btn = screen.getByRole('button');
    const region = screen.getByRole('region');
    expect(btn.getAttribute('aria-controls')).toBe(region.id);
  });

  it('body has role="region" when expanded', () => {
    render(
      <AccordionItem expanded={true} onToggle={() => {}} header={<span>H</span>}>
        body
      </AccordionItem>,
    );
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
});
