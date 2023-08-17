import RNFetchBlob from 'react-native-blob-util';
import { STORAGE_KEY } from '../constants';
import { InstagramStoryProps } from '../dto/instagramStoriesDTO';
import { ProgressStorageProps } from '../dto/helpersDTO';

const convertPath = ( path: string ) => `file://${path}`;

const getDownloadConfig = ( url: string ) => ( {
  path: `${RNFetchBlob.fs.dirs.DocumentDir}/${STORAGE_KEY}/${url}`,
} );

const downloadFile = async ( url: string ): Promise<string> => new Promise( ( resolve ) => {

  const fetchData = async () => {

    RNFetchBlob.config( getDownloadConfig( url ) ).fetch( 'GET', url ).then( ( res ) => {

      resolve( convertPath( res.path() ) );

    } ).catch( () => {

      setTimeout( fetchData, 1000 );

    } );

  };

  fetchData();

} );

export const loadImage = async ( url: string ) => {

  if ( await RNFetchBlob.fs.exists( getDownloadConfig( url ).path ) ) {

    return convertPath( getDownloadConfig( url ).path );

  }

  return downloadFile( url );

};

export const preloadStories = async (
  stories: InstagramStoryProps[],
  seen: ProgressStorageProps,
) => {

  const promises = stories.map( ( story ) => {

    const seenStoryIndex = story.stories.findIndex( ( item ) => item.id === seen[story.id] );
    const seenStory = story.stories[seenStoryIndex + 1] || story.stories[0];

    return loadImage( seenStory.imgUrl );

  } );

  await Promise.all( promises );

};