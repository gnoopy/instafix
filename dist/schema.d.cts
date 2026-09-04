/**
 * InstaFix database models — single source of truth.
 *
 * Used by:
 * - CLI to generate Prisma schema (via prisma-ast)
 * - Adapter for Zod validation
 * - Type exports
 *
 * This is a TS representation, NOT a .prisma file.
 * The CLI generates the actual Prisma schema from this definition.
 */
/** Prisma scalar types supported by InstaFix field definitions. */
export type PrismaScalarType = "String" | "Boolean" | "Int" | "BigInt" | "Float" | "Decimal" | "DateTime" | "Json" | "Bytes";
/** Prisma native column hints applied via `@db.<NativeType>`. */
export type PrismaNativeType = "Text" | "VarChar" | "Char" | "MediumText" | "LongText" | (string & {});
/** Relation cardinality between two InstaFix models. */
export type RelationKind = "1-to-many" | "many-to-1";
/** Prisma `onDelete` referential action. */
export type RelationOnDelete = "Cascade" | "Restrict" | "NoAction" | "SetNull" | "SetDefault";
/**
 * Relation metadata attached to a {@link FieldDef}.
 *
 * - `1-to-many` fields point at the related model and require no inverse
 *   column on this side (`fields`/`references` are inferred by Prisma).
 * - `many-to-1` fields own the foreign key — Prisma needs `fields` and
 *   `references` to wire it up.
 */
export interface RelationDef {
    kind: RelationKind;
    model: string;
    fields?: readonly string[];
    references?: readonly string[];
    onDelete?: RelationOnDelete;
}
/**
 * Definition of a single field in a InstaFix database model.
 *
 * The interface intentionally keeps a wide structural shape so it stays
 * easy to extend, but consumers can narrow via {@link isRelationField} /
 * {@link isScalarField} when relation vs. scalar logic diverges.
 */
export interface FieldDef {
    /** Prisma type (e.g. "String", "Int") for scalars, model name for relations. */
    type: PrismaScalarType | (string & {});
    /** Default literal (`"open"`) or function call (`now()`, `cuid()`). */
    default?: string;
    /** Whether the column is nullable. */
    optional?: boolean;
    /** Set on relation fields — absent on scalars. */
    relation?: RelationDef;
    isId?: boolean;
    isUnique?: boolean;
    /** Prisma native type attribute (e.g. "Text" for @db.Text) — used for MySQL compatibility on long strings */
    nativeType?: PrismaNativeType;
    /** Prisma @updatedAt attribute */
    isUpdatedAt?: boolean;
}
/** Narrowing predicate: returns `true` when `field` declares a Prisma relation. */
export declare function isRelationField(field: FieldDef): field is FieldDef & {
    relation: RelationDef;
};
/** Narrowing predicate: returns `true` when `field` is a Prisma scalar (no relation metadata). */
export declare function isScalarField(field: FieldDef): field is FieldDef & {
    relation?: undefined;
};
/** Definition of a composite index on a InstaFix database model. */
export interface IndexDef {
    fields: readonly string[];
}
/** Definition of a single InstaFix database model (fields + indexes). */
export interface ModelDef {
    fields: Record<string, FieldDef>;
    indexes?: readonly IndexDef[];
}
declare const _INSTAFIX_MODELS: {
    readonly InstaFixFeedback: {
        readonly fields: {
            readonly id: {
                readonly type: "String";
                readonly isId: true;
                readonly default: "cuid()";
            };
            readonly projectName: {
                readonly type: "String";
            };
            readonly type: {
                readonly type: "String";
            };
            readonly message: {
                readonly type: "String";
                readonly nativeType: "Text";
            };
            readonly status: {
                readonly type: "String";
                readonly default: "\"open\"";
            };
            readonly url: {
                readonly type: "String";
            };
            readonly urlPattern: {
                readonly type: "String";
                readonly optional: true;
            };
            readonly screenshotUrl: {
                readonly type: "String";
                readonly optional: true;
                readonly nativeType: "Text";
            };
            readonly screenshotRegion: {
                readonly type: "Json";
                readonly optional: true;
            };
            readonly diagnostics: {
                readonly type: "Json";
                readonly optional: true;
            };
            readonly viewport: {
                readonly type: "String";
            };
            readonly userAgent: {
                readonly type: "String";
            };
            readonly authorName: {
                readonly type: "String";
            };
            readonly authorEmail: {
                readonly type: "String";
            };
            readonly clientId: {
                readonly type: "String";
                readonly isUnique: true;
            };
            readonly resolvedAt: {
                readonly type: "DateTime";
                readonly optional: true;
            };
            readonly createdAt: {
                readonly type: "DateTime";
                readonly default: "now()";
            };
            readonly updatedAt: {
                readonly type: "DateTime";
                readonly isUpdatedAt: true;
            };
            readonly annotations: {
                readonly type: "InstaFixAnnotation";
                readonly relation: {
                    readonly kind: "1-to-many";
                    readonly model: "InstaFixAnnotation";
                };
            };
        };
        readonly indexes: readonly [{
            readonly fields: readonly ["projectName"];
        }, {
            readonly fields: readonly ["projectName", "status", "createdAt"];
        }, {
            readonly fields: readonly ["projectName", "url"];
        }];
    };
    readonly InstaFixAnnotation: {
        readonly fields: {
            readonly id: {
                readonly type: "String";
                readonly isId: true;
                readonly default: "cuid()";
            };
            readonly feedbackId: {
                readonly type: "String";
            };
            readonly feedback: {
                readonly type: "InstaFixFeedback";
                readonly relation: {
                    readonly kind: "many-to-1";
                    readonly model: "InstaFixFeedback";
                    readonly fields: readonly ["feedbackId"];
                    readonly references: readonly ["id"];
                    readonly onDelete: "Cascade";
                };
            };
            readonly cssSelector: {
                readonly type: "String";
                readonly nativeType: "Text";
            };
            readonly xpath: {
                readonly type: "String";
                readonly nativeType: "Text";
            };
            readonly textSnippet: {
                readonly type: "String";
                readonly nativeType: "Text";
            };
            readonly elementTag: {
                readonly type: "String";
            };
            readonly elementId: {
                readonly type: "String";
                readonly optional: true;
            };
            readonly textPrefix: {
                readonly type: "String";
                readonly nativeType: "Text";
            };
            readonly textSuffix: {
                readonly type: "String";
                readonly nativeType: "Text";
            };
            readonly fingerprint: {
                readonly type: "String";
            };
            readonly neighborText: {
                readonly type: "String";
                readonly nativeType: "Text";
            };
            readonly anchorKey: {
                readonly type: "String";
                readonly optional: true;
            };
            readonly xPct: {
                readonly type: "Float";
            };
            readonly yPct: {
                readonly type: "Float";
            };
            readonly wPct: {
                readonly type: "Float";
            };
            readonly hPct: {
                readonly type: "Float";
            };
            readonly scrollX: {
                readonly type: "Float";
            };
            readonly scrollY: {
                readonly type: "Float";
            };
            readonly viewportW: {
                readonly type: "Int";
            };
            readonly viewportH: {
                readonly type: "Int";
            };
            readonly devicePixelRatio: {
                readonly type: "Float";
                readonly default: "1";
            };
            readonly createdAt: {
                readonly type: "DateTime";
                readonly default: "now()";
            };
            readonly target: {
                readonly type: "Json";
                readonly optional: true;
            };
            readonly inspect: {
                readonly type: "Json";
                readonly optional: true;
            };
        };
        readonly indexes: readonly [{
            readonly fields: readonly ["feedbackId"];
        }];
    };
};
/** Map of InstaFix models keyed by model name — frozen at runtime. */
export declare const INSTAFIX_MODELS: typeof _INSTAFIX_MODELS;
/** Union of every InstaFix model name as a string literal. */
export type InstaFixModelName = keyof typeof INSTAFIX_MODELS;
/** Field names declared on a specific InstaFix model. */
export type InstaFixModelFieldName<M extends InstaFixModelName> = keyof (typeof INSTAFIX_MODELS)[M]["fields"];
export {};
