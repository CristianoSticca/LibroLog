import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#162b1d',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
        }}
      >
        {/* Book spine */}
        <div
          style={{
            position: 'absolute',
            left: '9px',
            top: '7px',
            width: '5px',
            height: '18px',
            background: '#d0e9d4',
            borderRadius: '2px',
          }}
        />
        {/* Book cover */}
        <div
          style={{
            position: 'absolute',
            left: '14px',
            top: '7px',
            width: '11px',
            height: '18px',
            background: '#fcf9f4',
            borderRadius: '2px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: '2px',
            gap: '3px',
          }}
        >
          <div style={{ width: '7px', height: '1.5px', background: '#c4c6cd', borderRadius: '1px' }} />
          <div style={{ width: '7px', height: '1.5px', background: '#c4c6cd', borderRadius: '1px' }} />
          <div style={{ width: '5px', height: '1.5px', background: '#c4c6cd', borderRadius: '1px' }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
