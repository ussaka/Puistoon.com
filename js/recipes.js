'use strict';

readRecipes();

async function readRecipes() {

    const response = await fetch('./data/recipes.json');
    const json = await response.json();
    const recipes = json.recipes;

    showRecipe(selectRandomRecipe(recipes));
}

function selectRandomRecipe(recipes) {
    const recipeIndex = Math.floor((Math.random() * recipes.length));
    return recipes[recipeIndex];
}

function showRecipe(recipe) {
    const parent = document.getElementById('recipe-section');
    const imagesPath = 'images/recipes/';

    // HTML for lightbox recipe images
    const imageHTML = `
    <a href="${imagesPath}${recipe.imgPath}"
        data-lightbox="image-recipe"
        data-title="${recipe.name}">
        <img class="recipe-img"
            src="${imagesPath}${recipe.imgPath}"
            alt="${recipe.imgAlt}"/>
    </a>`;

    // Create a list of recipe parts, each of which contain their title + ingredients list
    let ingredientsHTML = '';
    for (const recipePart of recipe.recipeParts) {
        ingredientsHTML += recipePart.title ? `<h5>${recipePart.title}</h5>` : '';
        ingredientsHTML += `<ul>${recipePart.ingredients.reduce((acc, cur) => acc + `<li>${cur}</li>`, '')}</ul>`
    }

    // Show new lines as HTML paragraphs
    const instructionsHTML = `<p>${recipe.instructions.replace(/\\n/g, '</p><p>')}</p>`;

    // Show the complete recipe HTML
    parent.innerHTML = `
    <h2>Päivän resepti</h2>
    <h3>${recipe.name}</h3>
    ${imageHTML}
    <h4>Raaka-aineet</h4>
    ${ingredientsHTML}
    <h4>Valmistusohje</h4>
    ${instructionsHTML}`;
}