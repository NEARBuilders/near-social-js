import {
  Suspense,
  lazy,
  type FC,
  type ComponentType,
  useState,
  useEffect,
  type CSSProperties,
} from 'react';
import { ErrorBoundary } from './error-boundary';
import { LoadingFallback } from './loading-fallback';
import { FadeIn } from './fade-in';

const SocialProvider = lazy(() =>
  import('near_social_js/providers').then((m) => ({ default: m.SocialProvider }))
);

const componentModules = {
  ProfileCard: lazy(() =>
    import('near_social_js/components').then((m) => ({ default: m.ProfileCard }))
  ),
  ProfileAvatar: lazy(() =>
    import('near_social_js/components').then((m) => ({ default: m.ProfileAvatar }))
  ),
  WalletButton: lazy(() =>
    import('near_social_js/components').then((m) => ({ default: m.WalletButton }))
  ),
  Logo: lazy(() =>
    import('near_social_js/components').then((m) => ({ default: m.Logo }))
  ),
  JsonViewer: lazy(() =>
    import('near_social_js/components').then((m) => ({ default: m.JsonViewer }))
  ),
  MethodCard: lazy(() =>
    import('near_social_js/components').then((m) => ({ default: m.MethodCard }))
  ),
  ResponsePanel: lazy(() =>
    import('near_social_js/components').then((m) => ({ default: m.ResponsePanel }))
  ),
};

const defaultProps: Record<string, Record<string, unknown>> = {
  ProfileCard: { accountId: 'root.near', profile: { name: 'Demo User' } },
  ProfileAvatar: { accountId: 'root.near', size: 64 },
  WalletButton: {},
  Logo: {},
  JsonViewer: { data: { message: 'Hello from Module Federation', version: '1.0.0' } },
  MethodCard: { title: 'getData', description: 'Fetches data from the social contract' },
  ResponsePanel: { response: { success: true, data: { key: 'value' } } },
};

const cardContainerStyle: CSSProperties = {
  background: '#fff',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const cardHeaderStyle: CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #e5e7eb',
  background: '#fafafa',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const cardTitleStyle: CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};

const previewContainerStyle: CSSProperties = {
  padding: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '120px',
  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
};

const propsToggleStyle: CSSProperties = {
  fontSize: '11px',
  color: '#6b7280',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  borderRadius: '4px',
  border: 'none',
  background: 'transparent',
};

const propsContainerStyle: CSSProperties = {
  borderTop: '1px solid #e5e7eb',
  background: '#f9fafb',
  padding: '12px 16px',
  fontSize: '11px',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  color: '#6b7280',
  overflow: 'auto',
  maxHeight: '120px',
};

const inlineLoaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#9ca3af',
  fontSize: '12px',
};

const spinnerStyle: CSSProperties = {
  width: '16px',
  height: '16px',
  border: '2px solid #e5e7eb',
  borderTopColor: '#6b7280',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

const errorBadgeStyle: CSSProperties = {
  fontSize: '11px',
  color: '#dc2626',
  background: '#fef2f2',
  padding: '4px 8px',
  borderRadius: '4px',
};

interface ComponentCardProps {
  name: string;
  Component: ComponentType<Record<string, unknown>>;
  props: Record<string, unknown>;
  index: number;
}

const ComponentCard: FC<ComponentCardProps> = ({ name, Component, props, index }) => {
  const [loaded, setLoaded] = useState(false);
  const [showProps, setShowProps] = useState(false);

  const cardAnimation: CSSProperties = {
    opacity: loaded ? 1 : 0,
    transform: loaded ? 'translateY(0)' : 'translateY(8px)',
    transition: `opacity 400ms ease-out ${index * 50}ms, transform 400ms ease-out ${index * 50}ms`,
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const hasProps = Object.keys(props).length > 0;

  return (
    <div style={{ ...cardContainerStyle, ...cardAnimation }}>
      <div style={cardHeaderStyle}>
        <span style={cardTitleStyle}>{`<${name} />`}</span>
        {hasProps && (
          <button
            onClick={() => setShowProps(!showProps)}
            style={propsToggleStyle}
          >
            {showProps ? '▼' : '▶'} Props
          </button>
        )}
      </div>
      <div style={previewContainerStyle}>
        <ErrorBoundary
          fallback={<span style={errorBadgeStyle}>Failed to load</span>}
        >
          <Suspense
            fallback={
              <div style={inlineLoaderStyle}>
                <div style={spinnerStyle} />
                <span>Loading...</span>
              </div>
            }
          >
            <ComponentWrapper>
              <Component {...props} />
            </ComponentWrapper>
          </Suspense>
        </ErrorBoundary>
      </div>
      {hasProps && showProps && (
        <div style={propsContainerStyle}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(props, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const ComponentWrapper: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(timer);
  }, []);

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transition: 'opacity 300ms ease-out',
  };

  return <div style={style}>{children}</div>;
};

const pageContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  background: '#f3f4f6',
};

const scrollContainerStyle: CSSProperties = {
  flex: 1,
  overflow: 'auto',
  padding: 'clamp(16px, 4vw, 32px)',
};

const contentWrapperStyle: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
};

const headerStyle: CSSProperties = {
  marginBottom: 'clamp(24px, 4vw, 40px)',
};

const titleStyle: CSSProperties = {
  fontSize: 'clamp(20px, 4vw, 28px)',
  fontWeight: 600,
  color: '#111827',
  margin: 0,
};

const subtitleStyle: CSSProperties = {
  fontSize: 'clamp(13px, 2vw, 15px)',
  color: '#6b7280',
  marginTop: '8px',
};

const codeStyle: CSSProperties = {
  background: '#e5e7eb',
  padding: '2px 6px',
  borderRadius: '4px',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: '0.9em',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 'clamp(16px, 3vw, 24px)',
};

export const Components: FC = () => {
  const [ready, setReady] = useState(false);
  const components = Object.entries(componentModules);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const wrapperAnimation: CSSProperties = {
    opacity: ready ? 1 : 0,
    transition: 'opacity 300ms ease-out',
  };

  return (
    <div style={{ ...pageContainerStyle, ...wrapperAnimation }}>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback message="Loading providers..." submessage="Setting up social context" />}>
          <SocialProvider network="mainnet">
            <div style={scrollContainerStyle}>
              <div style={contentWrapperStyle}>
                <FadeIn duration={500}>
                  <header style={headerStyle}>
                    <h1 style={titleStyle}>Component Gallery</h1>
                    <p style={subtitleStyle}>
                      Remote components from <code style={codeStyle}>near_social_js</code>
                    </p>
                  </header>
                </FadeIn>

                <div style={gridStyle}>
                  {components.map(([name, Component], index) => (
                    <ComponentCard
                      key={name}
                      name={name}
                      Component={Component as ComponentType<Record<string, unknown>>}
                      props={defaultProps[name] || {}}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </div>
          </SocialProvider>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default Components;
