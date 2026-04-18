import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import CompactAlbumGrid from './CompactAlbumGrid';
import { eurekaData } from '@/data/eureka-data';

const firstAction = eurekaData.logosActions[0]!;

afterEach(cleanup);

describe('CompactAlbumGrid in learn mode', () => {
  it('should call onToggleLearn when a tile is clicked', () => {
    const onToggleLearn = vi.fn();
    render(
      <CompactAlbumGrid
        mode="learn"
        learnedSkills={new Set()}
        usedSkillIds={new Set()}
        selectedSlot={null}
        onToggleLearn={onToggleLearn}
        onPickForSlot={() => {}}
      />
    );
    const tile = screen.getByRole('button', { name: firstAction.nameTw });
    fireEvent.click(tile);
    expect(onToggleLearn).toHaveBeenCalledWith(firstAction.id);
  });

  it('should visually mark learned skills', () => {
    render(
      <CompactAlbumGrid
        mode="learn"
        learnedSkills={new Set([firstAction.id])}
        usedSkillIds={new Set()}
        selectedSlot={null}
        onToggleLearn={() => {}}
        onPickForSlot={() => {}}
      />
    );
    const tile = screen.getByRole('button', { name: firstAction.nameTw });
    expect(tile.className).toMatch(/primary-dark/);
  });
});

describe('CompactAlbumGrid in slot-pick mode', () => {
  it('should call onPickForSlot when a tile is clicked and a slot is selected', () => {
    const onPickForSlot = vi.fn();
    render(
      <CompactAlbumGrid
        mode="slot-pick"
        learnedSkills={new Set()}
        usedSkillIds={new Set()}
        selectedSlot={0}
        onToggleLearn={() => {}}
        onPickForSlot={onPickForSlot}
      />
    );
    const tile = screen.getByRole('button', { name: firstAction.nameTw });
    fireEvent.click(tile);
    expect(onPickForSlot).toHaveBeenCalledWith(firstAction.id);
  });

  it('should not call any handler when no slot is selected', () => {
    const onPickForSlot = vi.fn();
    const onToggleLearn = vi.fn();
    render(
      <CompactAlbumGrid
        mode="slot-pick"
        learnedSkills={new Set()}
        usedSkillIds={new Set()}
        selectedSlot={null}
        onToggleLearn={onToggleLearn}
        onPickForSlot={onPickForSlot}
      />
    );
    const tile = screen.getByRole('button', { name: firstAction.nameTw });
    fireEvent.click(tile);
    expect(onPickForSlot).not.toHaveBeenCalled();
    expect(onToggleLearn).not.toHaveBeenCalled();
  });
});
