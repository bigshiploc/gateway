
<style>
        .testblock1{
                width: 960px;

        }
</style>
<template >
        <div :id="blockId" :coordinate="coordinate" class="block testblock1" :blockShow="blockShow" :windowWidth ="windowWidth" :regiontest="region" :regionName="regionName" :clear="clear" :equipment="equipment" :reset="reset"></div>
</template>


<script src="@/components/blockMoveComponents/blockMoveComponentsController.js"></script>
