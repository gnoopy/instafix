import * as zod from "zod";
import type { FeedbackPayload, FeedbackStatus, FeedbackType } from "./types.cjs";
export declare const screenshotRegionSchema: zod.ZodObject<{
    xPct: zod.ZodNumber;
    yPct: zod.ZodNumber;
    wPct: zod.ZodNumber;
    hPct: zod.ZodNumber;
}, zod.z.core.$strict>;
export declare const feedbackCreateSchema: zod.ZodObject<{
    projectName: zod.ZodString;
    type: zod.ZodEnum<{
        question: "question";
        change: "change";
        bug: "bug";
        other: "other";
    }>;
    message: zod.ZodString;
    url: zod.ZodString;
    urlPattern: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
    viewport: zod.ZodString;
    userAgent: zod.ZodString;
    authorName: zod.ZodString;
    authorEmail: zod.ZodEmail;
    annotations: zod.ZodArray<zod.ZodObject<{
        anchor: zod.ZodObject<{
            cssSelector: zod.ZodString;
            xpath: zod.ZodString;
            textSnippet: zod.ZodString;
            elementTag: zod.ZodString;
            elementId: zod.ZodOptional<zod.ZodString>;
            textPrefix: zod.ZodString;
            textSuffix: zod.ZodString;
            fingerprint: zod.ZodString;
            neighborText: zod.ZodString;
            anchorKey: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
        }, zod.z.core.$strip>;
        rect: zod.ZodObject<{
            xPct: zod.ZodNumber;
            yPct: zod.ZodNumber;
            wPct: zod.ZodNumber;
            hPct: zod.ZodNumber;
        }, zod.z.core.$strip>;
        scrollX: zod.ZodNumber;
        scrollY: zod.ZodNumber;
        viewportW: zod.ZodNumber;
        viewportH: zod.ZodNumber;
        devicePixelRatio: zod.ZodDefault<zod.ZodNumber>;
        target: zod.ZodOptional<zod.ZodNullable<zod.ZodDiscriminatedUnion<[zod.ZodObject<{
            kind: zod.ZodLiteral<"element">;
        }, zod.z.core.$strip>, zod.ZodObject<{
            kind: zod.ZodLiteral<"text">;
            quote: zod.ZodString;
            quotePrefix: zod.ZodString;
            quoteSuffix: zod.ZodString;
        }, zod.z.core.$strip>, zod.ZodObject<{
            kind: zod.ZodLiteral<"area">;
        }, zod.z.core.$strip>], "kind">>>;
        inspect: zod.ZodOptional<zod.ZodNullable<zod.ZodObject<{
            domPath: zod.ZodArray<zod.ZodString>;
            styles: zod.ZodRecord<zod.ZodString, zod.ZodString>;
            component: zod.ZodOptional<zod.ZodString>;
        }, zod.z.core.$strip>>>;
    }, zod.z.core.$strip>>;
    clientId: zod.ZodString;
    screenshotDataUrl: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
    screenshotRegion: zod.ZodOptional<zod.ZodNullable<zod.ZodObject<{
        xPct: zod.ZodNumber;
        yPct: zod.ZodNumber;
        wPct: zod.ZodNumber;
        hPct: zod.ZodNumber;
    }, zod.z.core.$strict>>>;
    diagnostics: zod.ZodOptional<zod.ZodNullable<zod.ZodObject<{
        console: zod.ZodArray<zod.ZodObject<{
            level: zod.ZodEnum<{
                log: "log";
                info: "info";
                warn: "warn";
                error: "error";
            }>;
            timestamp: zod.ZodString;
            message: zod.ZodString;
        }, zod.z.core.$strip>>;
        network: zod.ZodArray<zod.ZodObject<{
            url: zod.ZodString;
            method: zod.ZodString;
            status: zod.ZodNumber;
            durationMs: zod.ZodNumber;
            timestamp: zod.ZodString;
        }, zod.z.core.$strip>>;
    }, zod.z.core.$strip>>>;
}, zod.z.core.$strip>;
export declare const feedbackPatchSchema: zod.ZodObject<{
    id: zod.ZodString;
    projectName: zod.ZodString;
    status: zod.ZodEnum<{
        open: "open";
        in_progress: "in_progress";
        resolved: "resolved";
        wont_fix: "wont_fix";
    }>;
    message: zod.ZodOptional<zod.ZodString>;
    annotations: zod.ZodOptional<zod.ZodArray<zod.ZodObject<{
        anchor: zod.ZodObject<{
            cssSelector: zod.ZodString;
            xpath: zod.ZodString;
            textSnippet: zod.ZodString;
            elementTag: zod.ZodString;
            elementId: zod.ZodOptional<zod.ZodString>;
            textPrefix: zod.ZodString;
            textSuffix: zod.ZodString;
            fingerprint: zod.ZodString;
            neighborText: zod.ZodString;
            anchorKey: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
        }, zod.z.core.$strip>;
        rect: zod.ZodObject<{
            xPct: zod.ZodNumber;
            yPct: zod.ZodNumber;
            wPct: zod.ZodNumber;
            hPct: zod.ZodNumber;
        }, zod.z.core.$strip>;
        scrollX: zod.ZodNumber;
        scrollY: zod.ZodNumber;
        viewportW: zod.ZodNumber;
        viewportH: zod.ZodNumber;
        devicePixelRatio: zod.ZodDefault<zod.ZodNumber>;
        target: zod.ZodOptional<zod.ZodNullable<zod.ZodDiscriminatedUnion<[zod.ZodObject<{
            kind: zod.ZodLiteral<"element">;
        }, zod.z.core.$strip>, zod.ZodObject<{
            kind: zod.ZodLiteral<"text">;
            quote: zod.ZodString;
            quotePrefix: zod.ZodString;
            quoteSuffix: zod.ZodString;
        }, zod.z.core.$strip>, zod.ZodObject<{
            kind: zod.ZodLiteral<"area">;
        }, zod.z.core.$strip>], "kind">>>;
        inspect: zod.ZodOptional<zod.ZodNullable<zod.ZodObject<{
            domPath: zod.ZodArray<zod.ZodString>;
            styles: zod.ZodRecord<zod.ZodString, zod.ZodString>;
            component: zod.ZodOptional<zod.ZodString>;
        }, zod.z.core.$strip>>>;
    }, zod.z.core.$strip>>>;
}, zod.z.core.$strip>;
export declare const feedbackDeleteSchema: zod.ZodUnion<readonly [zod.ZodObject<{
    id: zod.ZodString;
    projectName: zod.ZodString;
}, zod.z.core.$strip>, zod.ZodObject<{
    projectName: zod.ZodString;
    deleteAll: zod.ZodLiteral<true>;
}, zod.z.core.$strip>]>;
export declare const getQuerySchema: zod.ZodObject<{
    projectName: zod.ZodString;
    page: zod.ZodDefault<zod.z.ZodCoercedNumber<unknown>>;
    limit: zod.ZodDefault<zod.z.ZodCoercedNumber<unknown>>;
    type: zod.ZodOptional<zod.ZodEnum<{
        question: "question";
        change: "change";
        bug: "bug";
        other: "other";
    }>>;
    status: zod.ZodOptional<zod.ZodEnum<{
        open: "open";
        in_progress: "in_progress";
        resolved: "resolved";
        wont_fix: "wont_fix";
    }>>;
    statuses: zod.ZodOptional<zod.ZodPreprocess<zod.ZodArray<zod.ZodEnum<{
        open: "open";
        in_progress: "in_progress";
        resolved: "resolved";
        wont_fix: "wont_fix";
    }>>>>;
    search: zod.ZodOptional<zod.ZodString>;
    url: zod.ZodOptional<zod.ZodString>;
    urlPattern: zod.ZodOptional<zod.ZodString>;
}, zod.z.core.$strip>;
export interface FeedbackPatchInput {
    id: string;
    projectName: string;
    status: FeedbackStatus;
    message?: string | undefined;
    annotations?: FeedbackPayload["annotations"] | undefined;
}
export interface FeedbackDeleteSingle {
    id: string;
    projectName: string;
}
export interface FeedbackDeleteAll {
    projectName: string;
    deleteAll: true;
}
export type FeedbackDeleteInput = FeedbackDeleteSingle | FeedbackDeleteAll;
export interface GetQueryInput {
    projectName: string;
    /** Set to 1 by schema default when omitted from raw input. */
    page: number;
    /** Set to 50 by schema default when omitted from raw input. */
    limit: number;
    type?: FeedbackType | undefined;
    status?: FeedbackStatus | undefined;
    statuses?: FeedbackStatus[] | undefined;
    search?: string | undefined;
    url?: string | undefined;
    urlPattern?: string | undefined;
}
/** Single validation issue extracted from a `ZodError`. */
export interface ValidationIssue {
    field: string;
    message: string;
}
/**
 * Map Zod errors to a flat array of `{ field, message }` objects.
 * Safe: does not leak input values or schema structure.
 */
export declare function formatValidationErrors(error: zod.z.ZodError): ValidationIssue[];
