<?php
/**
 * Plugin Name: BPR Article Bylines
 * Description: Adds the display names of published post coauthors to the REST API.
 * Version: 1.0.0
 */

defined( 'ABSPATH' ) || exit;

function bpr_rest_get_article_author_names( $data ) {
    $post = get_post( $data['id'] );
    if ( ! $post || 'publish' !== $post->post_status || post_password_required( $post ) || ! function_exists( 'get_coauthors' ) ) {
        return array();
    }

    $names = array();
    foreach ( get_coauthors( $post->ID ) as $author ) {
        $name = trim( (string) $author->display_name );
        if ( '' !== $name ) {
            $names[] = $name;
        }
    }

    return $names;
}

function bpr_register_article_author_names() {
    register_rest_field( 'post', 'bpr_author_names', array(
        'get_callback' => 'bpr_rest_get_article_author_names',
        'schema'       => array(
            'type'     => 'array',
            'items'    => array( 'type' => 'string' ),
            'context'  => array( 'view' ),
            'readonly' => true,
        ),
    ) );
}
add_action( 'rest_api_init', 'bpr_register_article_author_names' );
