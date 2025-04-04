import * as Slider from '@radix-ui/react-slider';
import { StandardSchemaV1 } from '@standard-schema/spec';
import * as schema from '@wsh-2025/schema/src/api/schema';
import { Duration } from 'luxon';
import invariant from 'tiny-invariant';
import { memo, useCallback, useMemo } from 'react';

import { Hoverable } from '@wsh-2025/client/src/features/layout/components/Hoverable';
import { SeekThumbnail } from '@wsh-2025/client/src/pages/episode/components/SeekThumbnail';
import { useCurrentTime } from '@wsh-2025/client/src/pages/episode/hooks/useCurrentTime';
import { useDuration } from '@wsh-2025/client/src/pages/episode/hooks/useDuration';
import { useMuted } from '@wsh-2025/client/src/pages/episode/hooks/useMuted';
import { usePlaying } from '@wsh-2025/client/src/pages/episode/hooks/usePlaying';

interface Props {
  episode: StandardSchemaV1.InferOutput<typeof schema.getEpisodeByIdResponse>;
}

interface SliderControllerProps {
  duration: number;
  currentTime: number;
  updateCurrentTime: (time: number) => void;
  episode: Props['episode'];
}

const SliderController = memo(
  ({ duration, currentTime, updateCurrentTime, episode }: SliderControllerProps) => {
    const handleValueChange = useCallback(
      ([t]: number[]) => {
        invariant(t);
        updateCurrentTime(t);
      },
      [updateCurrentTime]
    );

    return (
      <div className="group relative size-full">
        <div className="pointer-events-none relative size-full opacity-0 group-hover:opacity-100">
          <SeekThumbnail episode={episode} />
        </div>
        <Slider.Root
          className="group relative flex h-[20px] w-full cursor-pointer touch-none select-none flex-row items-center"
          max={duration}
          min={0}
          orientation="horizontal"
          value={[currentTime]}
          onValueChange={handleValueChange}
        >
          <Slider.Track className="grow-1 relative h-[2px] rounded-[4px] bg-[#999999] group-hover:h-[4px]">
            <Slider.Range className="absolute h-[2px] rounded-[4px] bg-[#1c43d1] group-hover:h-[4px]" />
          </Slider.Track>
          <Slider.Thumb className="block size-[20px] rounded-[10px] bg-[#1c43d1] opacity-0 focus:outline-none group-hover:opacity-100" />
        </Slider.Root>
      </div>
    );
  }
);

interface PlayPauseButtonProps {
  playing: boolean;
  togglePlaying: () => void;
  currentTime: number;
  duration: number;
}

const PlayPauseButton = memo(
  ({ playing, togglePlaying, currentTime, duration }: PlayPauseButtonProps) => {
    const formattedCurrentTime = useMemo(
      () => Duration.fromObject({ seconds: currentTime }).toFormat('mm:ss'),
      [currentTime]
    );
    const formattedDuration = useMemo(
      () => Duration.fromObject({ seconds: duration }).toFormat('mm:ss'),
      [duration]
    );

    return (
      <div className="flex flex-row items-center">
        <Hoverable classNames={{ default: 'bg-transparent', hovered: 'bg-[#FFFFFF1F]' }}>
          <button
            aria-label={playing ? '一時停止する' : '再生する'}
            className="block rounded-[4px]"
            type="button"
            onClick={togglePlaying}
          >
            <span
              className={`i-material-symbols:${playing ? 'pause-rounded' : 'play-arrow-rounded'} m-[14px] block size-[20px] shrink-0 grow-0 text-[#FFFFFF]`}
            />
          </button>
        </Hoverable>
        <span className="ml-[4px] block shrink-0 grow-0 text-[12px] font-bold text-[#FFFFFF]">
          {formattedCurrentTime} / {formattedDuration}
        </span>
      </div>
    );
  }
);

interface MuteButtonProps {
  muted: boolean;
  toggleMuted: () => void;
}

const MuteButton = memo(({ muted, toggleMuted }: MuteButtonProps) => {
  const handleClick = useCallback(() => {
    toggleMuted();
  }, [toggleMuted]);

  return (
    <Hoverable classNames={{ default: 'bg-transparent', hovered: 'bg-[#FFFFFF1F]' }}>
      <button
        aria-label={muted ? 'ミュート解除する' : 'ミュートする'}
        className="block rounded-[4px]"
        type="button"
        onClick={handleClick}
      >
        <span
          className={`i-material-symbols:${muted ? 'volume-off-rounded' : 'volume-up-rounded'} m-[14px] block size-[20px] shrink-0 grow-0 text-[#FFFFFF]`}
        />
      </button>
    </Hoverable>
  );
});

export const PlayerController = ({ episode }: Props) => {
  const duration = useDuration();
  const [currentTime, updateCurrentTime] = useCurrentTime();
  const [playing, togglePlaying] = usePlaying();
  const [muted, toggleMuted] = useMuted();

  return (
    <div className="relative h-[120px]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#212121] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 px-[12px]">
        <SliderController
          duration={duration}
          currentTime={currentTime}
          updateCurrentTime={updateCurrentTime}
          episode={episode}
        />
        <div className="flex w-full flex-row items-center justify-between">
          <PlayPauseButton
            playing={playing}
            togglePlaying={togglePlaying}
            currentTime={currentTime}
            duration={duration}
          />
          <MuteButton muted={muted} toggleMuted={toggleMuted} />
        </div>
      </div>
    </div>
  );
};
