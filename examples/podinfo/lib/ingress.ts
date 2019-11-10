import { Construct } from '@aws-cdk/core';
import { IngressObject as IngressApiObject } from '../../../lib/ingress';

export interface IngressTls {
  readonly hosts?: string[];
  readonly secretName?: string;
}

export interface IngressBackend {
  readonly servicePort: string;
  readonly serviceName: string;
}

export interface IngressOptions {
  /**
   * Ingress annotations
   */
  readonly annotations?: { [key: string]: any };

  /**
   * Ingress TLS configuration
   */
  readonly tls?: IngressTls[];

  /**
   * Ingress accepted hostnames
   */
  readonly hosts?: string[]

  /**
   * @default "/*"
   */
  readonly path?: string;
}

export interface IngressProps extends IngressOptions {
  /**
   * The backend for ingress controller.
   */
  readonly backend: IngressBackend;
}

export class Ingress extends Construct {
  constructor(scope: Construct, id: string, options: IngressProps) {
    super(scope, id);

    const tls = options.tls || [];
    const hosts = options.hosts || [];
    const ingressPath = options.path || '/*';

    const defaultRule = {
      http: {
        paths: [
          {
            path: ingressPath,
            backend: options.backend
          }
        ]
      }
    };

    new IngressApiObject(this, 'Default', {
      metadata: {
        annotations: options.annotations
      },
      spec: {
        tls: tls.map((o: IngressTls) => ({ hosts: o.hosts, secretName: o.secretName })),
        rules: hosts.length > 0 
          ? hosts.map(host => ({ host, ...defaultRule })) 
          : [ defaultRule ]
      }
    });
  }
}