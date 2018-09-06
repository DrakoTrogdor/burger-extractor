/*
    Block merger

    This script will try to find missing block data from the old mcdata blocks

*/

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

const wiki = require('../lib/wiki')

const colors = [
  'white',
  'orange',
  'magenta',
  'light_blue',
  'yellow',
  'lime',
  'pink',
  'gray',
  'light_gray',
  'cyan',
  'purple',
  'blue',
  'brown',
  'green',
  'red',
  'black'
]

const woodTypes = [
  'jungle',
  'oak',
  'dark_oak',
  'birch',
  'spruce',
  'acacia',
  'stripped_jungle',
  'stripped_oak',
  'stripped_dark_oak',
  'stripped_birch',
  'stripped_spruce',
  'stripped_acacia'
]

module.exports = (outputDirectory, oldData) => new Promise(async (resolve, reject) => {
  console.log(chalk.green('    Merging block data'))
  // Read required files
  const blocksPath = path.join(outputDirectory, 'blocks.json')
  const blocks = JSON.parse(fs.readFileSync(blocksPath))

  // Loop for each block
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]

    // Find the same block in the old version data
    const [ oldBlock ] = Object.values(oldData.blocks).filter(oldBlock => oldBlock.name === block.name)

    if (oldBlock) {
      // Merge values
      block.transparent = oldBlock.transparent
      block.filterLight = oldBlock.filterLight
      block.emitLight = oldBlock.emitLight
      block.boundingBox = oldBlock.boundingBox
      continue
    }

    /*
     Most of the following code will only be executed with new blocks or 1.12 to 1.13 merges
    */

    // Check if the block is a colored variant of an old block
    if (colors.some(color => block.name.startsWith(color))) {
      // Get block name without the color prefix and the following underscore
      const name = block.name.replace(new RegExp(colors.join('|')), '').substr(1)

      // Filter false positives
      if (['nether_bricks', 'sandstone_slab', 'tone_wall_torch', 'tulip', 'orchid', 'sand', 'ice'].includes(name)) continue

      // Find if there's a block in the old data with the same name (red_wool -> wool, yellow_terracotta -> terracotta)
      const [ oldBlock ] = Object.values(oldData.blocks).filter(oldBlock => {
        if (name === 'banner') return oldBlock.name === 'standing_banner'
        if (name === 'terracotta') return oldBlock.name === 'white_glazed_terracotta'

        return oldBlock.name === name
      })

      if (!oldBlock) {
        console.log(chalk.red(`      Could not find the old block match for ${name} (${block.name})`))
        continue
      }

      // Merge values
      block.transparent = oldBlock.transparent
      block.filterLight = oldBlock.filterLight
      block.emitLight = oldBlock.emitLight
      block.boundingBox = oldBlock.boundingBox
      continue
    }

    // Check if the block is a wooden variant of an old block

    if (woodTypes.some(type => { return block.name.startsWith(type) })) {
      // Get block name without the wooden prefix and the following underscore
      const name = block.name.replace(new RegExp(woodTypes.join('|')), '').substr(1)

      // Find if there's a block in the old data with the same name (oak_wood -> oak_log, oak_pressure_plate -> wooden_pressure_plate)
      const [ oldBlock ] = Object.values(oldData.blocks).filter(oldBlock => {
        if (name === 'wood') return oldBlock.name === 'log'
        if (name === 'door') return oldBlock.name === 'wooden_door'
        if (name === 'pressure_plate') return oldBlock.name === 'wooden_pressure_plate'
        if (name === 'button') return oldBlock.name === 'wooden_button'
        if (name === 'slab') return oldBlock.name === 'stone_slab'

        return oldBlock.name === name
      })

      if (!oldBlock) {
        console.log(chalk.red(`      Could not find the old block match for ${name} (${block.name})`))
        continue
      }

      // Merge values
      block.transparent = oldBlock.transparent
      block.filterLight = oldBlock.filterLight
      block.emitLight = oldBlock.emitLight
      block.boundingBox = oldBlock.boundingBox
      continue
    }

    // Try to manually find the block in the old mcdat
    // Try and find old block
    const [ oldBlockAttempt ] = Object.values(oldData.blocks).filter(oldBlock => {
      if (block.name.startsWith('potted_')) return oldBlock.name === 'flower_pot'
      if (block.name.startsWith('attached_')) return oldBlock.name === 'melon_stem'
      if (block.name.endsWith('_slab')) return oldBlock.name === 'stone_slab'
      if (block.name.endsWith('_skull')) return oldBlock.name === 'skull'
      if (block.name.endsWith('_head')) return oldBlock.name === 'skull'
      if (block.name.endsWith('_stairs')) return oldBlock.name === 'stone_stairs'
      if (block.name.indexOf('stone_bricks') > -1) return oldBlock.name === 'stonebrick'

      if (block.name === 'smooth_quartz') return oldBlock.name === 'quartz_block'
      if (block.name === 'quartz_pillar') return oldBlock.name === 'quartz_block'
      if (block.name.startsWith('cut_')) return oldBlock.name === block.name.replace('cut_', '')
      if (block.name.startsWith('chiseled_')) return oldBlock.name === block.name.replace('chiseled_', '')
      if (block.name.startsWith('smooth_')) return oldBlock.name === block.name.replace('smooth_', '')
      if (block.name.startsWith('infested_')) return oldBlock.name === block.name.replace('infested_', '')
      if (block.name.startsWith('mossy_')) return oldBlock.name === block.name.replace('mossy_', '')

      if ([
        'dandelion', 'poppy', 'allium',
        'azure_bluet', 'oxeye_daisy', 'peony'
      ].includes(block.name)) return oldBlock.name === 'prismarine'

      if ([
        'large_fern', 'rose_bush', 'lilac', 'sunflower'
      ].includes(block.name)) return oldBlock.name === 'double_plant'

      if ([
        'dandelion', 'poppy', 'allium', 'azure_bluet', 'oxeye_daisy'
      ].includes(block.name)) return oldBlock.name === 'red_flower'

      if ([
        'granite', 'diorite', 'andesite',
        'polished_granite', 'polished_diorite', 'polished_andesite'
      ].includes(block.name)) return oldBlock.name === 'stone'

      if ([
        'grass_block', 'coarse_dirt', 'podzol'
      ].includes(block.name)) return oldBlock.name === 'grass'

      if (block.name === 'nether_bricks') return oldBlock.name === 'nether_brick'
      if (block.name === 'wet_sponge') return oldBlock.name === 'sponge'
      if (block.name === 'cobweb') return oldBlock.name === 'web'
      if (block.name === 'spawner') return oldBlock.name === 'mob_spawner'
      if (block.name === 'wall_torch') return oldBlock.name === 'torch'
      if (block.name === 'carved_pumpkin') return oldBlock.name === 'pumpkin'
      if (block.name === 'jack_o_lantern') return oldBlock.name === 'lit_pumpkin'
      if (block.name === 'sugar_cane') return oldBlock.name === 'reeds'
      if (block.name === 'powered_rail') return oldBlock.name === 'golden_rail'
      if (block.name === 'nether_portal') return oldBlock.name === 'portal'
      if (block.name === 'terracotta') return oldBlock.name === 'white_glazed_terracotta'
      if (block.name === 'fern') return oldBlock.name === 'tallgrass'
      if (block.name === 'dead_bush') return oldBlock.name === 'deadbush'
      if (block.name === 'melon') return oldBlock.name === 'melon_block'
      if (block.name === 'mushroom_stem') return oldBlock.name === 'red_mushroom_block'
      if (block.name === 'sign') return oldBlock.name === 'standing_sign'
      if (block.name === 'snow_block') return oldBlock.name === 'snow'
      if (block.name === 'moving_piston') return oldBlock.name === 'piston_extension'
      if (block.name === 'repeater') return oldBlock.name === 'powered_repeater'
      if (block.name === 'comparator') return oldBlock.name === 'powered_comparator'
      if (block.name === 'lily_pad') return oldBlock.name === 'waterlily'
      if (block.name === 'dark_prismarine') return oldBlock.name === 'prismarine'
      if (block.name === 'prismarine_bricks') return oldBlock.name === 'prismarine'
      if (block.name === 'damaged_anvil') return oldBlock.name === 'anvil'
      if (block.name === 'chipped_anvil') return oldBlock.name === 'anvil'
      if (block.name === 'shulker_box') return oldBlock.name === 'white_shulker_box'
      if (block.name === 'slime_block') return oldBlock.name === 'slime'

      // Fallback to just removing the underscore and see if it works
      return oldBlock.name === block.name.replace(/[_-]/g, '')
    })

    // We couldn't find the block in the old mcdata, assume it's a new block
    if (oldBlockAttempt) {
      // Merge values
      block.transparent = oldBlockAttempt.transparent
      block.filterLight = oldBlockAttempt.filterLight
      block.emitLight = oldBlockAttempt.emitLight
      block.boundingBox = oldBlockAttempt.boundingBox
      continue
    }

    // The block variable is now a new block. We require the user or the wiki to give us the data
    // Group the block maybe (*_coral_block, *_coal_wall_fan, *_wall_fan)

    // Get block data from wiki
    try {
      const blockData = await wiki.getBlockInfo(block.name)
      block.transparent = blockData.transparent
      block.filterLight = blockData.filterLight
      block.emitLight = blockData.emitLight
      block.boundingBox = blockData.boundingBox
    } catch (e) {
      console.log(chalk.red(`      ${e.toString()}`))
    }
    // console.log(chalk.yellow(`      Possible new block ${block.name}`))
  }

  fs.writeFileSync(blocksPath, JSON.stringify(blocks, null, 2))
  resolve()
})
