import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#162b1d',
          width: '180px',
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Book spine */}
        <div
          style={{
            position: 'absolute',
            left: '50px',
            top: '38px',
            width: '18px',
            height: '104px',
            background: '#d0e9d4',
            borderRadius: '9px',
          }}
        />
        {/* Book cover */}
        <div
          style={{
            position: 'absolute',
            left: '68px',
            top: '38px',
            width: '62px',
            height: '104px',
            background: '#fcf9f4',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: '10px',
            gap: '10px',
          }}
        >
          <div style={{ width: '42px', height: '9px', background: '#c4c6cd', borderRadius: '4px' }} />
          <div style={{ width: '42px', height: '9px', background: '#c4c6cd', borderRadius: '4px' }} />
          <div style={{ width: '30px', height: '9px', background: '#c4c6cd', borderRadius: '4px' }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
