import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import InventorySidebar from './InventorySidebar';

afterEach(() => cleanup());

const mats = [
  { id: 1, tcName: '異質結晶', enName: 'Protean Crystal', iconId: 0, category: 'crystal' as const },
];

describe('InventorySidebar', () => {
  it('shows new title text "素材庫存：0/1 種已輸入"', () => {
    render(<InventorySidebar materials={mats} inventory={{}} onMaterialChange={() => {}} onClear={() => {}} />);
    expect(screen.getByText(/素材庫存：0\/1 種已輸入/)).toBeInTheDocument();
  });

  it('shows registered count in title when materials have inventory', () => {
    render(<InventorySidebar materials={mats} inventory={{ 1: 5 }} onMaterialChange={() => {}} onClear={() => {}} />);
    expect(screen.getByText(/素材庫存：1\/1 種已輸入/)).toBeInTheDocument();
  });

  it('has ?icon button with aria-label', () => {
    render(<InventorySidebar materials={mats} inventory={{}} onMaterialChange={() => {}} onClear={() => {}} />);
    const helpButton = screen.getByRole('button', { name: '素材庫存說明' });
    expect(helpButton).toBeInTheDocument();
    expect(helpButton).toHaveTextContent('?');
  });

  it('renders OCR button with disabled state', () => {
    render(<InventorySidebar materials={mats} inventory={{}} onMaterialChange={() => {}} onClear={() => {}} />);
    const ocrButton = screen.getByRole('button', { name: '截圖匯入（即將推出）' });
    expect(ocrButton).toBeInTheDocument();
    expect(ocrButton).toHaveTextContent('📷 截圖匯入（即將推出）');
  });

  it('OCR button has aria-disabled="true"', () => {
    render(<InventorySidebar materials={mats} inventory={{}} onMaterialChange={() => {}} onClear={() => {}} />);
    const ocrButton = screen.getByRole('button', { name: '截圖匯入（即將推出）' });
    expect(ocrButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('expands to show MaterialTile when 展開 clicked', () => {
    const fn = vi.fn();
    render(<InventorySidebar materials={mats} inventory={{}} onMaterialChange={fn} onClear={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '展開' }));
    expect(screen.getByText('異質結晶')).toBeInTheDocument();
  });

  it('calls onClear when 清空 clicked', () => {
    const fn = vi.fn();
    render(<InventorySidebar materials={mats} inventory={{ 1: 5 }} onMaterialChange={() => {}} onClear={fn} />);
    fireEvent.click(screen.getByRole('button', { name: '清空' }));
    expect(fn).toHaveBeenCalled();
  });

  it('has sticky class on md+ breakpoint', () => {
    const { container } = render(
      <InventorySidebar materials={mats} inventory={{}} onMaterialChange={() => {}} onClear={() => {}} />,
    );
    const root = container.firstChild as HTMLElement | null;
    expect(root?.className).toContain('md:sticky');
  });
});
