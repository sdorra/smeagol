/**
 * Copyright (c) 2016 Cloudogu GmbH. All Rights Reserved.
 * 
 * Copyright notice
 */

package com.cloudogu.wiki;

/**
 * Application Stage. The stage determines if the application is trimmed for performance and security or more for fast 
 * development cycles.
 * 
 * @author Sebastian Sdorra
 */
public enum Stage {

    /**
     * Application is trimmed for security and perfomance. This stage should be used for production deployments. The
     * production stage is the default stage.
     */
    PRODUCTION, 
    
    /**
     * Application is trimmed for faster development cycles and auto reload. In the development stage the most caches
     * and security checks are disabled. <strong>Warning:</strong> This stage should never be used in production.
     */
    DEVELOPMENT;
    
}
