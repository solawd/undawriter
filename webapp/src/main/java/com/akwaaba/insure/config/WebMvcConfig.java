package com.undawriter.insure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/");

        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);

                        // If the exact file exists, return it (e.g. /favicon.ico)
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }
                        
                        // If it's an API call, let the controllers handle it
                        if (resourcePath.startsWith("api/")) {
                            return null;
                        }

                        // For Next.js static exports, /customer maps to /customer.html
                        Resource htmlResource = location.createRelative(resourcePath + ".html");
                        if (htmlResource.exists() && htmlResource.isReadable()) {
                            return htmlResource;
                        }

                        // Try adding /index.html (for directories with trailingSlash: true)
                        Resource indexHtmlResource = location.createRelative(resourcePath + "/index.html");
                        if (indexHtmlResource.exists() && indexHtmlResource.isReadable()) {
                            return indexHtmlResource;
                        }

                        // Handle Next.js App Router client payloads (.txt)
                        if (resourcePath.endsWith(".txt")) {
                            // If /customer.txt is requested but Next.js outputted /customer/index.txt
                            String pathWithoutTxt = resourcePath.substring(0, resourcePath.length() - 4);
                            Resource indexTxtResource = location.createRelative(pathWithoutTxt + "/index.txt");
                            if (indexTxtResource.exists() && indexTxtResource.isReadable()) {
                                return indexTxtResource;
                            }
                        }

                        // Fallback to index.html for client-side routing
                        return location.createRelative("index.html");
                    }
                });
    }
}
