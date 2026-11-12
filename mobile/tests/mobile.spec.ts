import { test, expect } from "@playwright/test";
test("lecture, favoris persistants, recherche, chapitres et réglages", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByText("Un moment avec Dieu.")).toBeVisible({
    timeout: 90000,
  });
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
  await page.getByRole("tab", { name: "La Bible", exact: true }).click();
  await expect(
    page
      .getByRole("button", { name: "Choisir un livre et un chapitre" })
      .getByText("Jean 1", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Verset 1\./ }).click();
  await page
    .getByRole("button", { name: "Ajouter aux favoris", exact: true })
    .click();
  await page.getByRole("tab", { name: "Favoris", exact: true }).click();
  await expect(page.getByText("Jean 1, 1", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("tab", { name: "Favoris", exact: true }).click();
  await expect(page.getByText("Jean 1, 1", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Recherche", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Rechercher dans la Bible" })
    .fill("Dieu a tant aimé");
  await page
    .getByRole("button", { name: "Lire Jean 3, 16", exact: true })
    .click();
  await expect(page.getByText("Jean 3, 16", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Fermer le verset" }).click();
  await page.getByRole("button", { name: "Chapitre suivant" }).click();
  await expect(
    page
      .getByRole("button", { name: "Choisir un livre et un chapitre" })
      .getByText("Jean 4", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Choisir un livre et un chapitre" })
    .click();
  await page.getByRole("button", { name: "Genèse", exact: true }).click();
  await page.getByRole("button", { name: "Chapitre 1", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: /^Verset 1\. Au commencement, Dieu créa/,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Réglages", exact: true }).click();
  await page.getByRole("radio", { name: "Texte 24", exact: true }).click();
  await page.getByRole("button", { name: "Activer le thème sombre" }).click();
  await page.getByRole("button", { name: "Fermer les réglages" }).click();
  await expect(
    page.getByText("Votre confort de lecture", { exact: true }),
  ).not.toBeVisible();
  await page.screenshot({
    path: "test-results/reader-dark.png",
    fullPage: true,
  });
  await page.reload();
  await page.getByRole("tab", { name: "La Bible", exact: true }).click();
  await expect(
    page
      .getByRole("button", { name: "Choisir un livre et un chapitre" })
      .getByText("Genèse 1", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Réglages", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Activer le thème clair" }),
  ).toBeVisible();
  await expect(page.getByRole("radio", { name: "Texte 24" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  expect(errors).toEqual([]);
});
test("écran étroit sans débordement et lecture hors ligne", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await expect(page.getByText("Un moment avec Dieu.")).toBeVisible({
    timeout: 90000,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await context.setOffline(true);
  await page.getByRole("tab", { name: "La Bible", exact: true }).click();
  await expect(page.getByRole("button", { name: /^Verset 1\./ })).toBeVisible();
  await page.getByRole("button", { name: "Chapitre suivant" }).click();
  await expect(
    page
      .getByRole("button", { name: "Choisir un livre et un chapitre" })
      .getByText("Jean 2", { exact: true }),
  ).toBeVisible();
});
